import type { Food } from "@/modules/foods/domain/food";

export const TEST_ONLY_PUBLISHED_FOOD: Food = {
  id: "00000000-0000-4000-8000-000000000101",
  canonicalNameKo: "TEST ONLY — 운영 사용 금지 식품",
  categoryCode: "TEST_ONLY",
  foodKind: "RAW",
  preparationState: "UNKNOWN",
  defaultBasis: { amount: 100, unit: "G" },
  status: "PUBLISHED",
  publishedAt: "2026-11-02T00:00:00.000Z",
  nutrients: [
    {
      nutrientCode: "SODIUM",
      amount: 0,
      unit: "MG",
      basis: { amount: 100, unit: "G" },
      status: "PRESENT",
      displayText: "0",
      sourceId: "00000000-0000-4000-8000-000000000201",
    },
    {
      nutrientCode: "POTASSIUM",
      amount: null,
      unit: "MG",
      basis: { amount: 100, unit: "G" },
      status: "MISSING",
      displayText: "정보 없음",
      sourceId: "00000000-0000-4000-8000-000000000201",
    },
  ],
  sources: [
    {
      id: "00000000-0000-4000-8000-000000000201",
      publisher: "TEST ONLY — 운영 사용 금지",
      title: "TEST ONLY — 계약 검증 출처",
      url: "https://example.invalid/test-only",
      retrievedAt: "2026-11-02T00:00:00.000Z",
    },
  ],
};

export const TEST_ONLY_DRAFT_FOOD: Food = {
  ...TEST_ONLY_PUBLISHED_FOOD,
  id: "00000000-0000-4000-8000-000000000102",
  canonicalNameKo: "TEST ONLY — 미게시 식품",
  status: "DRAFT",
  publishedAt: null,
};
