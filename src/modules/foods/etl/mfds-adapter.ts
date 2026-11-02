import { z } from "zod";

import {
  completeNutrients,
  parseBasis,
  parseNutrient,
  type AdapterResult,
  type ValidationIssue,
} from "@/modules/foods/etl/canonical";

const mfdsRowSchema = z
  .object({
    FOOD_CD: z.string().trim().min(1),
    FOOD_NM_KR: z.string().trim().min(1),
    FOOD_CAT_CD: z.string().trim().min(1),
    REVISION: z.string().trim().min(1),
    FOOD_KIND: z.enum(["RAW", "PROCESSED", "DISH"]),
    PREP_STATE: z
      .enum(["UNKNOWN", "RAW", "BOILED", "STEAMED", "GRILLED", "BAKED", "FRIED", "OTHER"])
      .default("UNKNOWN"),
    SERVING_SIZE: z.union([z.string(), z.number()]),
    SERVING_UNIT: z.string(),
    ENERGY: z.unknown().optional().nullable(),
    ENERGY_UNIT: z.string().default("KCAL"),
    PROTEIN: z.unknown().optional().nullable(),
    PROTEIN_UNIT: z.string().default("G"),
    SODIUM: z.unknown().optional().nullable(),
    SODIUM_UNIT: z.string().default("MG"),
    POTASSIUM: z.unknown().optional().nullable(),
    POTASSIUM_UNIT: z.string().default("MG"),
    PHOSPHORUS: z.unknown().optional().nullable(),
    PHOSPHORUS_UNIT: z.string().default("MG"),
    WATER: z.unknown().optional().nullable(),
    WATER_UNIT: z.string().default("ML"),
  })
  .passthrough();

export function adaptMfdsRow(input: unknown): AdapterResult {
  const parsed = mfdsRowSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      issues: parsed.error.issues.map((issue) => ({
        code: "INVALID_SCHEMA" as const,
        field: issue.path.join(".") || "row",
        message: "식약처 응답 구조를 확인해 주세요.",
      })),
    };
  }

  const row = parsed.data;
  const basis = parseBasis(row.SERVING_SIZE, row.SERVING_UNIT);
  if ("error" in basis) {
    return {
      ok: false,
      issues: [{ code: "INVALID_UNIT", field: "SERVING_UNIT", message: basis.error }],
    };
  }

  const fields = [
    ["ENERGY", row.ENERGY, row.ENERGY_UNIT],
    ["PROTEIN", row.PROTEIN, row.PROTEIN_UNIT],
    ["SODIUM", row.SODIUM, row.SODIUM_UNIT],
    ["POTASSIUM", row.POTASSIUM, row.POTASSIUM_UNIT],
    ["PHOSPHORUS", row.PHOSPHORUS, row.PHOSPHORUS_UNIT],
    ["WATER", row.WATER, row.WATER_UNIT],
  ] as const;
  const issues: Omit<ValidationIssue, "recordIndex">[] = [];
  const nutrients = fields.flatMap(([code, value, unit]) => {
    const nutrient = parseNutrient(code, value, unit);
    if ("error" in nutrient) {
      issues.push({ code: nutrient.kind, field: code, message: nutrient.error });
      return [];
    }
    return [nutrient];
  });
  if (issues.length > 0) return { ok: false, issues };

  return {
    ok: true,
    record: {
      sourceKind: "MFDS_OPEN_API",
      externalId: row.FOOD_CD,
      sourceRevision: row.REVISION,
      canonicalNameKo: row.FOOD_NM_KR,
      categoryCode: row.FOOD_CAT_CD,
      foodKind: row.FOOD_KIND,
      preparationState: row.PREP_STATE,
      basisAmount: basis.amount,
      basisUnit: basis.unit,
      nutrients: completeNutrients(nutrients),
      rawPayload: row,
    },
  };
}
