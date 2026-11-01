export const PROFILE_SCHEMA_VERSION = 1;
export const PROFILE_STORAGE_KEY = `renaltable.profile.v${PROFILE_SCHEMA_VERSION}`;

export const TREATMENT_MODES = [
  "unset",
  "nonDialysis",
  "hemodialysis",
  "peritonealDialysis",
] as const;
export type TreatmentMode = (typeof TREATMENT_MODES)[number];

export const NUTRIENT_KINDS = ["sodium", "potassium", "phosphorus", "protein", "fluid"] as const;
export type NutrientKind = (typeof NUTRIENT_KINDS)[number];

export type NutritionTarget = {
  nutrient: NutrientKind;
  value: number;
  unit: "mg" | "g" | "mL";
  period: "day";
  source: "clinician";
  updatedAt: string;
};

export type Profile = {
  treatmentMode: TreatmentMode;
  allergies: string[];
  excludedIngredients: string[];
  nutritionTargets: NutritionTarget[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isStringList(value: unknown): value is string[] {
  return (
    Array.isArray(value) && value.every((item) => typeof item === "string" && item.length <= 100)
  );
}

function isNutritionTarget(value: unknown): value is NutritionTarget {
  if (!isRecord(value)) return false;

  return (
    NUTRIENT_KINDS.includes(value.nutrient as NutrientKind) &&
    typeof value.value === "number" &&
    Number.isFinite(value.value) &&
    value.value > 0 &&
    ["mg", "g", "mL"].includes(value.unit as string) &&
    value.period === "day" &&
    value.source === "clinician" &&
    typeof value.updatedAt === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(value.updatedAt)
  );
}

export function isProfile(value: unknown): value is Profile {
  if (!isRecord(value)) return false;

  return (
    TREATMENT_MODES.includes(value.treatmentMode as TreatmentMode) &&
    isStringList(value.allergies) &&
    isStringList(value.excludedIngredients) &&
    Array.isArray(value.nutritionTargets) &&
    value.nutritionTargets.every(isNutritionTarget)
  );
}
