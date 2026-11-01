import { describe, expect, it } from "vitest";
import { isPlanner } from "./planner";

describe("플래너 스키마", () => {
  it("비어 있는 주간 식단을 허용한다", () => {
    expect(
      isPlanner({
        weekStart: "2026-11-02",
        slots: [],
        checkedShoppingItemIds: [],
      }),
    ).toBe(true);
  });

  it("알 수 없는 끼니 구분을 거부한다", () => {
    expect(
      isPlanner({
        weekStart: "2026-11-02",
        slots: [{ date: "2026-11-02", mealType: "snack", itemId: "item-id" }],
        checkedShoppingItemIds: [],
      }),
    ).toBe(false);
  });
});
