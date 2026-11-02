// @vitest-environment node

import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const ids = {
  source: "00000000-0000-4000-8000-000000000001",
  importLog: "00000000-0000-4000-8000-000000000002",
  food: "00000000-0000-4000-8000-000000000003",
  otherFood: "00000000-0000-4000-8000-000000000004",
  nutrient: "00000000-0000-4000-8000-000000000005",
  sourceRecord: "00000000-0000-4000-8000-000000000006",
} as const;

describe("Phase 2 PostgreSQL schema", () => {
  const client = new PGlite();

  beforeAll(async () => {
    await migrate(drizzle(client), { migrationsFolder: "db/migrations" });
    await client.exec(`
      INSERT INTO content_source (
        id, publisher, title, url, source_type, retrieved_at, content_hash
      ) VALUES (
        '${ids.source}',
        'TEST ONLY — 운영 사용 금지',
        'TEST ONLY — 스키마 검증 출처',
        'https://example.invalid/test-only',
        'FOOD_DB',
        '2026-11-02T00:00:00Z',
        '${"a".repeat(64)}'
      );

      INSERT INTO food_import_log (
        id, source_id, started_at, finished_at, status, schema_version,
        normalizer_version, raw_object_uri, raw_sha256, record_count,
        accepted_count, rejected_count
      ) VALUES (
        '${ids.importLog}', '${ids.source}', '2026-11-02T00:00:00Z',
        '2026-11-02T00:01:00Z', 'VALIDATED', 'test-v1', 'test-v1',
        'test-only://fixture', '${"b".repeat(64)}', 1, 1, 0
      );

      INSERT INTO food (
        id, canonical_name_ko, category_code, food_kind,
        default_basis_amount, default_basis_unit
      ) VALUES
        ('${ids.food}', 'TEST ONLY — 스키마 검증 식품', 'TEST_ONLY', 'RAW', 1, 'G'),
        ('${ids.otherFood}', 'TEST ONLY — 계보 불일치 식품', 'TEST_ONLY', 'RAW', 1, 'G');

      INSERT INTO nutrient_definition (
        id, code, name_ko, canonical_unit, display_precision
      ) VALUES (
        '${ids.nutrient}', 'SODIUM', 'TEST ONLY — 나트륨 필드', 'MG', 0
      );

      INSERT INTO food_source_record (
        id, source_id, import_log_id, food_id, external_id, source_revision, raw_payload
      ) VALUES (
        '${ids.sourceRecord}', '${ids.source}', '${ids.importLog}', '${ids.food}',
        'TEST-ONLY-001', 'test-v1', '{"testOnly":true}'
      );
    `);
  });

  afterAll(async () => {
    await client.close();
  });

  it("migration으로 Phase 2 식품 테이블만 만든다", async () => {
    const result = await client.query<{ table_name: string }>(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    expect(result.rows.map((row) => row.table_name)).toEqual([
      "content_source",
      "food",
      "food_import_log",
      "food_nutrient",
      "food_source_record",
      "nutrient_definition",
    ]);
  });

  it("출처가 PRESENT로 제공한 숫자 0은 보존한다", async () => {
    await expect(
      client.exec(`
        INSERT INTO food_nutrient (
          food_id, nutrient_id, amount, unit, basis_amount, basis_unit,
          value_status, source_record_id
        ) VALUES (
          '${ids.food}', '${ids.nutrient}', 0, 'MG', 1, 'G', 'PRESENT', '${ids.sourceRecord}'
        );
      `),
    ).resolves.toBeDefined();
  });

  it.each([
    { label: "MISSING 0", amount: "0", status: "MISSING", basis: 2 },
    { label: "PRESENT NULL", amount: "NULL", status: "PRESENT", basis: 3 },
    { label: "PRESENT 음수", amount: "-1", status: "PRESENT", basis: 4 },
  ])("잘못된 상태-값 조합 $label을 거부한다", async ({ amount, status, basis }) => {
    await expect(
      client.exec(`
        INSERT INTO food_nutrient (
          food_id, nutrient_id, amount, unit, basis_amount, basis_unit,
          value_status, source_record_id
        ) VALUES (
          '${ids.food}', '${ids.nutrient}', ${amount}, 'MG', ${basis}, 'G',
          '${status}', '${ids.sourceRecord}'
        );
      `),
    ).rejects.toThrow(/food_nutrient_value_status_amount/);
  });

  it("원본 레코드와 다른 식품에 영양 관측을 연결하지 않는다", async () => {
    await expect(
      client.exec(`
        INSERT INTO food_nutrient (
          food_id, nutrient_id, amount, unit, basis_amount, basis_unit,
          value_status, source_record_id
        ) VALUES (
          '${ids.otherFood}', '${ids.nutrient}', 1, 'MG', 5, 'G',
          'PRESENT', '${ids.sourceRecord}'
        );
      `),
    ).rejects.toThrow(/food_nutrient_source_food_fk/);
  });

  it("게시 시각 없는 PUBLISHED 식품을 거부한다", async () => {
    await expect(
      client.exec(`
        INSERT INTO food (
          canonical_name_ko, category_code, food_kind, default_basis_amount,
          default_basis_unit, status
        ) VALUES (
          'TEST ONLY — 게시 제약 식품', 'TEST_ONLY', 'RAW', 1, 'G', 'PUBLISHED'
        );
      `),
    ).rejects.toThrow(/food_published_at_required/);
  });
});
