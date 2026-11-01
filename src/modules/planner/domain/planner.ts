export const PLANNER_SCHEMA_VERSION = 1;
export const PLANNER_STORAGE_KEY = `renaltable.planner.v${PLANNER_SCHEMA_VERSION}`;

export const MEAL_TYPES = ["breakfast", "lunch", "dinner"] as const;
export type MealType = (typeof MEAL_TYPES)[number];

export type PlannerSlot = {
  date: string;
  mealType: MealType;
  itemId: string;
};

export type Planner = {
  weekStart: string;
  slots: PlannerSlot[];
  checkedShoppingItemIds: string[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isDate(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function isPlannerSlot(value: unknown): value is PlannerSlot {
  if (!isRecord(value)) return false;

  return (
    isDate(value.date) &&
    MEAL_TYPES.includes(value.mealType as MealType) &&
    typeof value.itemId === "string" &&
    value.itemId.length > 0 &&
    value.itemId.length <= 100
  );
}

export function isPlanner(value: unknown): value is Planner {
  if (!isRecord(value)) return false;

  return (
    isDate(value.weekStart) &&
    Array.isArray(value.slots) &&
    value.slots.every(isPlannerSlot) &&
    Array.isArray(value.checkedShoppingItemIds) &&
    value.checkedShoppingItemIds.every(
      (item) => typeof item === "string" && item.length > 0 && item.length <= 100,
    )
  );
}
