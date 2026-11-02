import { z } from "zod";

import { NUTRIENT_CODES } from "@/modules/foods/domain/food";
import type {
  BasisUnit,
  NutrientCode,
  NutrientUnit,
  NutrientValueStatus,
} from "@/modules/foods/domain/food";

export const SOURCE_KINDS = ["MFDS_OPEN_API", "STANDARD_PUBLIC_DATA"] as const;
export type SourceKind = (typeof SOURCE_KINDS)[number];

export type CanonicalNutrient = {
  code: NutrientCode;
  amount: number | null;
  unit: NutrientUnit;
  valueStatus: NutrientValueStatus;
};

export type CanonicalStagingRecord = {
  sourceKind: SourceKind;
  externalId: string;
  sourceRevision: string;
  canonicalNameKo: string;
  categoryCode: string;
  foodKind: "RAW" | "PROCESSED" | "DISH";
  preparationState:
    "UNKNOWN" | "RAW" | "BOILED" | "STEAMED" | "GRILLED" | "BAKED" | "FRIED" | "OTHER";
  basisAmount: number;
  basisUnit: BasisUnit;
  nutrients: CanonicalNutrient[];
  rawPayload: Readonly<Record<string, unknown>>;
};

export type ValidationIssue = {
  recordIndex: number;
  code: "INVALID_SCHEMA" | "INVALID_VALUE" | "INVALID_UNIT" | "DUPLICATE_SOURCE_KEY";
  field: string;
  message: string;
};

export type AdapterResult =
  | { ok: true; record: CanonicalStagingRecord }
  | { ok: false; issues: Omit<ValidationIssue, "recordIndex">[] };

export type QualityReport = {
  sourceKind: SourceKind;
  recordCount: number;
  acceptedCount: number;
  rejectedCount: number;
  duplicateCandidates: string[];
  nutrientCompleteness: Record<
    NutrientCode,
    { present: number; zero: number; missing: number; trace: number }
  >;
  issues: ValidationIssue[];
  canCreatePublishTarget: boolean;
};

export type ImportResult = {
  stagingRecords: CanonicalStagingRecord[];
  publishableRecords: CanonicalStagingRecord[];
  report: QualityReport;
};

export const unitSchema = z.enum(["KCAL", "G", "MG", "ML"]);
export const basisUnitSchema = z.enum(["G", "ML", "SERVING"]);

export function parseBasis(rawAmount: unknown, rawUnit: unknown) {
  const amount = parseNonnegativeNumber(rawAmount);
  const unit = typeof rawUnit === "string" ? rawUnit.trim().toUpperCase() : "";
  const parsedUnit = basisUnitSchema.safeParse(unit);
  if (amount === null || amount <= 0)
    return { error: "기준량은 0보다 큰 숫자여야 합니다." } as const;
  if (!parsedUnit.success) return { error: "지원하지 않는 기준 단위입니다." } as const;
  return { amount, unit: parsedUnit.data } as const;
}

export function parseNutrient(
  code: NutrientCode,
  rawValue: unknown,
  rawUnit: unknown,
): CanonicalNutrient | { error: string; kind: "INVALID_VALUE" | "INVALID_UNIT" } {
  const unitText = typeof rawUnit === "string" ? rawUnit.trim().toUpperCase() : "";
  const parsedUnit = unitSchema.safeParse(unitText);
  if (!parsedUnit.success) return { error: `${code} 단위를 확인해 주세요.`, kind: "INVALID_UNIT" };

  if (rawValue === null || rawValue === undefined || rawValue === "") {
    return { code, amount: null, unit: parsedUnit.data, valueStatus: "MISSING" };
  }
  if (typeof rawValue === "string") {
    const valueText = rawValue.trim().toUpperCase();
    if (["TR", "TRACE", "미량"].includes(valueText)) {
      return { code, amount: null, unit: parsedUnit.data, valueStatus: "TRACE" };
    }
    if (["<LOQ", "BELOW_LIMIT", "정량한계미만"].includes(valueText)) {
      return { code, amount: null, unit: parsedUnit.data, valueStatus: "BELOW_LIMIT" };
    }
  }
  const amount = parseNonnegativeNumber(rawValue);
  if (amount === null)
    return { error: `${code} 값은 0 이상의 숫자여야 합니다.`, kind: "INVALID_VALUE" };
  return { code, amount, unit: parsedUnit.data, valueStatus: "PRESENT" };
}

export function completeNutrients(nutrients: CanonicalNutrient[]) {
  const known = new Map(nutrients.map((nutrient) => [nutrient.code, nutrient]));
  return NUTRIENT_CODES.map(
    (code): CanonicalNutrient =>
      known.get(code) ?? {
        code,
        amount: null,
        unit: defaultUnit(code),
        valueStatus: "MISSING",
      },
  );
}

export function runImport(
  sourceKind: SourceKind,
  rows: readonly unknown[],
  adapter: (row: unknown) => AdapterResult,
): ImportResult {
  const stagingRecords: CanonicalStagingRecord[] = [];
  const issues: ValidationIssue[] = [];

  rows.forEach((row, recordIndex) => {
    const result = adapter(row);
    if (result.ok) stagingRecords.push(result.record);
    else issues.push(...result.issues.map((issue) => ({ ...issue, recordIndex })));
  });

  const keys = new Map<string, number[]>();
  stagingRecords.forEach((record, recordIndex) => {
    const key = `${record.sourceKind}:${record.externalId}:${record.sourceRevision}`;
    keys.set(key, [...(keys.get(key) ?? []), recordIndex]);
  });
  const duplicateCandidates = [...keys.entries()]
    .filter(([, indexes]) => indexes.length > 1)
    .map(([key]) => key)
    .sort();
  duplicateCandidates.forEach((key) => {
    issues.push({
      recordIndex: keys.get(key)?.[1] ?? 0,
      code: "DUPLICATE_SOURCE_KEY",
      field: "externalId/sourceRevision",
      message: "같은 출처 키의 중복 후보는 자동 병합하지 않습니다.",
    });
  });

  const nutrientCompleteness = Object.fromEntries(
    NUTRIENT_CODES.map((code) => [code, { present: 0, zero: 0, missing: 0, trace: 0 }]),
  ) as QualityReport["nutrientCompleteness"];
  stagingRecords.forEach((record) => {
    record.nutrients.forEach((nutrient) => {
      const summary = nutrientCompleteness[nutrient.code];
      if (nutrient.valueStatus === "PRESENT") {
        summary.present += 1;
        if (nutrient.amount === 0) summary.zero += 1;
      } else if (nutrient.valueStatus === "MISSING") summary.missing += 1;
      else if (nutrient.valueStatus === "TRACE") summary.trace += 1;
    });
  });

  const canCreatePublishTarget = issues.length === 0 && stagingRecords.length === rows.length;
  return {
    stagingRecords,
    publishableRecords: canCreatePublishTarget ? stagingRecords : [],
    report: {
      sourceKind,
      recordCount: rows.length,
      acceptedCount: stagingRecords.length,
      rejectedCount: rows.length - stagingRecords.length,
      duplicateCandidates,
      nutrientCompleteness,
      issues,
      canCreatePublishTarget,
    },
  };
}

function parseNonnegativeNumber(value: unknown) {
  if (typeof value === "number") return Number.isFinite(value) && value >= 0 ? value : null;
  if (typeof value !== "string" || value.trim() === "") return null;
  const parsed = Number(value.replaceAll(",", "").trim());
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function defaultUnit(code: NutrientCode): NutrientUnit {
  if (code === "ENERGY") return "KCAL";
  if (code === "PROTEIN") return "G";
  if (code === "WATER") return "ML";
  return "MG";
}
