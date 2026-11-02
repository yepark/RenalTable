export const NUTRIENT_CODES = [
  "ENERGY",
  "PROTEIN",
  "SODIUM",
  "POTASSIUM",
  "PHOSPHORUS",
  "WATER",
] as const;

export type NutrientCode = (typeof NUTRIENT_CODES)[number];
export type NutrientUnit = "KCAL" | "G" | "MG" | "ML";
export type BasisUnit = "G" | "ML" | "SERVING";
export type NutrientValueStatus =
  "PRESENT" | "TRACE" | "BELOW_LIMIT" | "MISSING" | "NOT_APPLICABLE";

export type FoodNutrient = {
  nutrientCode: NutrientCode;
  amount: number | null;
  unit: NutrientUnit;
  basis: { amount: number; unit: BasisUnit };
  status: NutrientValueStatus;
  displayText: string;
  sourceId: string;
};

export type FoodSource = {
  id: string;
  publisher: string;
  title: string;
  url: string;
  retrievedAt: string;
};

export type Food = {
  id: string;
  canonicalNameKo: string;
  categoryCode: string;
  foodKind: "RAW" | "PROCESSED" | "DISH";
  preparationState:
    "UNKNOWN" | "RAW" | "BOILED" | "STEAMED" | "GRILLED" | "BAKED" | "FRIED" | "OTHER";
  defaultBasis: { amount: number; unit: BasisUnit };
  status: "DRAFT" | "REVIEWED" | "PUBLISHED" | "RETIRED";
  nutrients: FoodNutrient[];
  sources: FoodSource[];
  publishedAt: string | null;
};

export function nutrientDisplayText(status: NutrientValueStatus, amount: number | null) {
  if (status === "PRESENT" && amount !== null) return String(amount);
  if (status === "TRACE") return "미량";
  if (status === "BELOW_LIMIT") return "정량 한계 미만";
  if (status === "NOT_APPLICABLE") return "해당 없음";
  return "정보 없음";
}
