import { z } from "zod";

import {
  completeNutrients,
  parseBasis,
  parseNutrient,
  type AdapterResult,
  type ValidationIssue,
} from "@/modules/foods/etl/canonical";

const standardRowSchema = z
  .object({
    식품코드: z.string().trim().min(1),
    식품명: z.string().trim().min(1),
    식품대분류코드: z.string().trim().min(1),
    데이터기준일자: z.string().trim().min(1),
    식품유형: z.enum(["원재료", "가공식품", "음식"]),
    영양성분함량기준량: z.union([z.string(), z.number()]),
    기준량단위: z.string(),
    에너지: z.unknown().optional().nullable(),
    에너지단위: z.string().default("KCAL"),
    단백질: z.unknown().optional().nullable(),
    단백질단위: z.string().default("G"),
    나트륨: z.unknown().optional().nullable(),
    나트륨단위: z.string().default("MG"),
    칼륨: z.unknown().optional().nullable(),
    칼륨단위: z.string().default("MG"),
    인: z.unknown().optional().nullable(),
    인단위: z.string().default("MG"),
    수분: z.unknown().optional().nullable(),
    수분단위: z.string().default("ML"),
  })
  .passthrough();

const FOOD_KIND = { 원재료: "RAW", 가공식품: "PROCESSED", 음식: "DISH" } as const;

export function adaptStandardDataRow(input: unknown): AdapterResult {
  const parsed = standardRowSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      issues: parsed.error.issues.map((issue) => ({
        code: "INVALID_SCHEMA" as const,
        field: issue.path.join(".") || "row",
        message: "표준데이터 응답 구조를 확인해 주세요.",
      })),
    };
  }

  const row = parsed.data;
  const basis = parseBasis(row.영양성분함량기준량, row.기준량단위);
  if ("error" in basis) {
    return {
      ok: false,
      issues: [{ code: "INVALID_UNIT", field: "기준량단위", message: basis.error }],
    };
  }
  const fields = [
    ["ENERGY", row.에너지, row.에너지단위],
    ["PROTEIN", row.단백질, row.단백질단위],
    ["SODIUM", row.나트륨, row.나트륨단위],
    ["POTASSIUM", row.칼륨, row.칼륨단위],
    ["PHOSPHORUS", row.인, row.인단위],
    ["WATER", row.수분, row.수분단위],
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
      sourceKind: "STANDARD_PUBLIC_DATA",
      externalId: row.식품코드,
      sourceRevision: row.데이터기준일자,
      canonicalNameKo: row.식품명,
      categoryCode: row.식품대분류코드,
      foodKind: FOOD_KIND[row.식품유형],
      preparationState: "UNKNOWN",
      basisAmount: basis.amount,
      basisUnit: basis.unit,
      nutrients: completeNutrients(nutrients),
      rawPayload: row,
    },
  };
}
