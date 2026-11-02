// @vitest-environment node

import { describe, expect, it } from "vitest";

import { runImport } from "@/modules/foods/etl/canonical";
import { adaptMfdsRow } from "@/modules/foods/etl/mfds-adapter";
import { adaptStandardDataRow } from "@/modules/foods/etl/standard-data-adapter";

const TEST_ONLY_MFDS_ROW = {
  FOOD_CD: "TEST-001",
  FOOD_NM_KR: "TEST ONLY — 운영 사용 금지 식품",
  FOOD_CAT_CD: "TEST_ONLY",
  REVISION: "test-v1",
  FOOD_KIND: "RAW",
  PREP_STATE: "UNKNOWN",
  SERVING_SIZE: "100",
  SERVING_UNIT: "G",
  ENERGY: null,
  ENERGY_UNIT: "KCAL",
  PROTEIN: null,
  PROTEIN_UNIT: "G",
  SODIUM: "0",
  SODIUM_UNIT: "MG",
  POTASSIUM: null,
  POTASSIUM_UNIT: "MG",
  PHOSPHORUS: "",
  PHOSPHORUS_UNIT: "MG",
  WATER: "TRACE",
  WATER_UNIT: "ML",
} as const;

describe("Phase 2 source adapter와 품질 보고서", () => {
  it("PRESENT 0과 MISSING null, TRACE null을 구분하고 칼륨·인 누락을 보고한다", () => {
    const result = runImport("MFDS_OPEN_API", [TEST_ONLY_MFDS_ROW], adaptMfdsRow);
    const record = result.stagingRecords[0];

    expect(record?.nutrients.find((item) => item.code === "SODIUM")).toMatchObject({
      amount: 0,
      valueStatus: "PRESENT",
    });
    expect(record?.nutrients.find((item) => item.code === "POTASSIUM")).toMatchObject({
      amount: null,
      valueStatus: "MISSING",
    });
    expect(record?.nutrients.find((item) => item.code === "PHOSPHORUS")).toMatchObject({
      amount: null,
      valueStatus: "MISSING",
    });
    expect(record?.nutrients.find((item) => item.code === "WATER")).toMatchObject({
      amount: null,
      valueStatus: "TRACE",
    });
    expect(result.report.nutrientCompleteness.POTASSIUM.missing).toBe(1);
    expect(result.report.nutrientCompleteness.PHOSPHORUS.missing).toBe(1);
    expect(result.report.nutrientCompleteness.SODIUM.zero).toBe(1);
  });

  it.each([
    ["잘못된 값", { ...TEST_ONLY_MFDS_ROW, SODIUM: "-1" }, "INVALID_VALUE"],
    ["잘못된 단위", { ...TEST_ONLY_MFDS_ROW, SODIUM_UNIT: "mcg" }, "INVALID_UNIT"],
  ])("%s이면 전체 배치의 게시 대상을 만들지 않는다", (_label, row, issueCode) => {
    const result = runImport("MFDS_OPEN_API", [TEST_ONLY_MFDS_ROW, row], adaptMfdsRow);

    expect(result.report.issues).toEqual(
      expect.arrayContaining([expect.objectContaining({ code: issueCode })]),
    );
    expect(result.report.canCreatePublishTarget).toBe(false);
    expect(result.publishableRecords).toEqual([]);
  });

  it("동일 출처 키를 중복 후보로 보고하고 자동 병합하거나 게시하지 않는다", () => {
    const result = runImport(
      "MFDS_OPEN_API",
      [TEST_ONLY_MFDS_ROW, { ...TEST_ONLY_MFDS_ROW, FOOD_NM_KR: "TEST ONLY — 이름 충돌" }],
      adaptMfdsRow,
    );

    expect(result.stagingRecords).toHaveLength(2);
    expect(result.report.duplicateCandidates).toEqual(["MFDS_OPEN_API:TEST-001:test-v1"]);
    expect(result.publishableRecords).toEqual([]);
  });

  it("표준 공공데이터 응답을 동일 canonical staging 계약으로 변환한다", () => {
    const result = adaptStandardDataRow({
      식품코드: "TEST-STANDARD-001",
      식품명: "TEST ONLY — 표준데이터 식품",
      식품대분류코드: "TEST_ONLY",
      데이터기준일자: "test-v1",
      식품유형: "원재료",
      영양성분함량기준량: 100,
      기준량단위: "G",
      나트륨: 0,
      나트륨단위: "MG",
    });

    expect(result).toMatchObject({
      ok: true,
      record: { sourceKind: "STANDARD_PUBLIC_DATA", foodKind: "RAW", basisAmount: 100 },
    });
  });

  it("필수 키 누락을 schema 오류로 처리한다", () => {
    const result = runImport("MFDS_OPEN_API", [{ FOOD_CD: "TEST-BROKEN" }], adaptMfdsRow);
    expect(result.report.rejectedCount).toBe(1);
    expect(result.report.issues[0]?.code).toBe("INVALID_SCHEMA");
    expect(result.publishableRecords).toEqual([]);
  });
});
