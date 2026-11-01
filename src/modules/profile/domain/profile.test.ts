import { describe, expect, it } from "vitest";
import { isProfile } from "./profile";

describe("프로필 스키마", () => {
  it.each(["unset", "nonDialysis", "hemodialysis", "peritonealDialysis"])(
    "치료 상태 %s를 서로 구분해 허용한다",
    (treatmentMode) => {
      expect(
        isProfile({
          treatmentMode,
          allergies: [],
          excludedIngredients: [],
          nutritionTargets: [],
        }),
      ).toBe(true);
    },
  );

  it("출처가 없거나 0인 영양 목표를 거부한다", () => {
    expect(
      isProfile({
        treatmentMode: "unset",
        allergies: [],
        excludedIngredients: [],
        nutritionTargets: [
          {
            nutrient: "sodium",
            value: 0,
            unit: "mg",
            period: "day",
            updatedAt: "2026-11-01",
          },
        ],
      }),
    ).toBe(false);
  });
});
