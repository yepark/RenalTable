import { sql } from "drizzle-orm";
import {
  check,
  foreignKey,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

export const sourceType = pgEnum("source_type", ["FOOD_DB", "GUIDELINE", "RECIPE", "OTHER"]);
export const sourceStatus = pgEnum("source_status", ["ACTIVE", "SUPERSEDED", "UNAVAILABLE"]);
export const importStatus = pgEnum("food_import_status", [
  "FETCHED",
  "VALIDATED",
  "NEEDS_REVIEW",
  "APPROVED",
  "PUBLISHED",
  "FAILED",
]);
export const foodKind = pgEnum("food_kind", ["RAW", "PROCESSED", "DISH"]);
export const preparationState = pgEnum("preparation_state", [
  "UNKNOWN",
  "RAW",
  "BOILED",
  "STEAMED",
  "GRILLED",
  "BAKED",
  "FRIED",
  "OTHER",
]);
export const foodStatus = pgEnum("food_status", ["DRAFT", "REVIEWED", "PUBLISHED", "RETIRED"]);
export const nutrientCode = pgEnum("nutrient_code", [
  "ENERGY",
  "PROTEIN",
  "SODIUM",
  "POTASSIUM",
  "PHOSPHORUS",
  "WATER",
]);
export const nutrientUnit = pgEnum("nutrient_unit", ["KCAL", "G", "MG", "ML"]);
export const basisUnit = pgEnum("basis_unit", ["G", "ML", "SERVING"]);
export const nutrientValueStatus = pgEnum("nutrient_value_status", [
  "PRESENT",
  "TRACE",
  "BELOW_LIMIT",
  "MISSING",
  "NOT_APPLICABLE",
]);

export const contentSources = pgTable(
  "content_source",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    publisher: text("publisher").notNull(),
    title: text("title").notNull(),
    url: text("url").notNull(),
    sourceType: sourceType("source_type").notNull(),
    licenseName: text("license_name"),
    licenseUrl: text("license_url"),
    publishedAt: timestamp("published_at", { withTimezone: true, mode: "date" }),
    retrievedAt: timestamp("retrieved_at", { withTimezone: true, mode: "date" }).notNull(),
    contentHash: text("content_hash").notNull(),
    status: sourceStatus("status").default("ACTIVE").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    check("content_source_publisher_not_blank", sql`length(btrim(${table.publisher})) > 0`),
    check("content_source_title_not_blank", sql`length(btrim(${table.title})) > 0`),
    check("content_source_url_not_blank", sql`length(btrim(${table.url})) > 0`),
    check("content_source_hash_not_blank", sql`length(btrim(${table.contentHash})) > 0`),
  ],
);

export const foodImportLogs = pgTable(
  "food_import_log",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    sourceId: uuid("source_id")
      .notNull()
      .references(() => contentSources.id, { onDelete: "restrict" }),
    startedAt: timestamp("started_at", { withTimezone: true, mode: "date" }).notNull(),
    finishedAt: timestamp("finished_at", { withTimezone: true, mode: "date" }),
    status: importStatus("status").notNull(),
    schemaVersion: text("schema_version").notNull(),
    normalizerVersion: text("normalizer_version").notNull(),
    rawObjectUri: text("raw_object_uri").notNull(),
    rawSha256: text("raw_sha256").notNull(),
    recordCount: integer("record_count").notNull(),
    acceptedCount: integer("accepted_count").notNull(),
    rejectedCount: integer("rejected_count").notNull(),
    errorSummary: text("error_summary"),
    approvedBy: text("approved_by"),
    approvedAt: timestamp("approved_at", { withTimezone: true, mode: "date" }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    index("food_import_log_source_started_idx").on(table.sourceId, table.startedAt),
    unique("food_import_log_id_source_unique").on(table.id, table.sourceId),
    check(
      "food_import_log_counts_nonnegative",
      sql`${table.recordCount} >= 0 AND ${table.acceptedCount} >= 0 AND ${table.rejectedCount} >= 0`,
    ),
    check(
      "food_import_log_counts_within_total",
      sql`${table.acceptedCount} + ${table.rejectedCount} <= ${table.recordCount}`,
    ),
    check(
      "food_import_log_finished_after_started",
      sql`${table.finishedAt} IS NULL OR ${table.finishedAt} >= ${table.startedAt}`,
    ),
    check("food_import_log_sha256_format", sql`${table.rawSha256} ~ '^[0-9a-f]{64}$'`),
  ],
);

export const foods = pgTable(
  "food",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    canonicalNameKo: text("canonical_name_ko").notNull(),
    categoryCode: text("category_code").notNull(),
    foodKind: foodKind("food_kind").notNull(),
    preparationState: preparationState("preparation_state").default("UNKNOWN").notNull(),
    defaultBasisAmount: numeric("default_basis_amount", { precision: 18, scale: 6 }).notNull(),
    defaultBasisUnit: basisUnit("default_basis_unit").notNull(),
    status: foodStatus("status").default("DRAFT").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
    publishedAt: timestamp("published_at", { withTimezone: true, mode: "date" }),
  },
  (table) => [
    index("food_status_category_name_idx").on(
      table.status,
      table.categoryCode,
      table.canonicalNameKo,
    ),
    check("food_name_not_blank", sql`length(btrim(${table.canonicalNameKo})) > 0`),
    check("food_category_not_blank", sql`length(btrim(${table.categoryCode})) > 0`),
    check("food_default_basis_positive", sql`${table.defaultBasisAmount} > 0`),
    check(
      "food_published_at_required",
      sql`${table.status} <> 'PUBLISHED' OR ${table.publishedAt} IS NOT NULL`,
    ),
  ],
);

export const foodSourceRecords = pgTable(
  "food_source_record",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    sourceId: uuid("source_id")
      .notNull()
      .references(() => contentSources.id, { onDelete: "restrict" }),
    importLogId: uuid("import_log_id")
      .notNull()
      .references(() => foodImportLogs.id, { onDelete: "restrict" }),
    foodId: uuid("food_id").references(() => foods.id, { onDelete: "restrict" }),
    externalId: text("external_id").notNull(),
    sourceRevision: text("source_revision").notNull(),
    rawPayload: jsonb("raw_payload").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    unique("food_source_record_source_external_revision_unique").on(
      table.sourceId,
      table.externalId,
      table.sourceRevision,
    ),
    unique("food_source_record_id_food_unique").on(table.id, table.foodId),
    foreignKey({
      columns: [table.importLogId, table.sourceId],
      foreignColumns: [foodImportLogs.id, foodImportLogs.sourceId],
      name: "food_source_record_import_source_fk",
    }).onDelete("restrict"),
    check("food_source_record_external_id_not_blank", sql`length(btrim(${table.externalId})) > 0`),
    check("food_source_record_revision_not_blank", sql`length(btrim(${table.sourceRevision})) > 0`),
  ],
);

export const nutrientDefinitions = pgTable(
  "nutrient_definition",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    code: nutrientCode("code").notNull().unique(),
    nameKo: text("name_ko").notNull(),
    canonicalUnit: nutrientUnit("canonical_unit").notNull(),
    displayPrecision: integer("display_precision").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    check("nutrient_definition_name_not_blank", sql`length(btrim(${table.nameKo})) > 0`),
    check("nutrient_definition_precision_range", sql`${table.displayPrecision} BETWEEN 0 AND 6`),
  ],
);

export const foodNutrients = pgTable(
  "food_nutrient",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    foodId: uuid("food_id")
      .notNull()
      .references(() => foods.id, { onDelete: "restrict" }),
    nutrientId: uuid("nutrient_id")
      .notNull()
      .references(() => nutrientDefinitions.id, { onDelete: "restrict" }),
    amount: numeric("amount", { precision: 18, scale: 6 }),
    unit: nutrientUnit("unit").notNull(),
    basisAmount: numeric("basis_amount", { precision: 18, scale: 6 }).notNull(),
    basisUnit: basisUnit("basis_unit").notNull(),
    valueStatus: nutrientValueStatus("value_status").notNull(),
    sourceRecordId: uuid("source_record_id").notNull(),
    measuredAt: timestamp("measured_at", { withTimezone: true, mode: "date" }),
    sourceUpdatedAt: timestamp("source_updated_at", { withTimezone: true, mode: "date" }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    unique("food_nutrient_observation_unique").on(
      table.foodId,
      table.nutrientId,
      table.sourceRecordId,
      table.basisAmount,
      table.basisUnit,
    ),
    index("food_nutrient_food_nutrient_idx").on(table.foodId, table.nutrientId),
    index("food_nutrient_present_amount_idx")
      .on(table.nutrientId, table.amount)
      .where(sql`${table.valueStatus} = 'PRESENT'`),
    foreignKey({
      columns: [table.sourceRecordId, table.foodId],
      foreignColumns: [foodSourceRecords.id, foodSourceRecords.foodId],
      name: "food_nutrient_source_food_fk",
    }).onDelete("restrict"),
    check("food_nutrient_basis_positive", sql`${table.basisAmount} > 0`),
    check(
      "food_nutrient_value_status_amount",
      sql`(
        ${table.valueStatus} = 'PRESENT'
        AND ${table.amount} IS NOT NULL
        AND ${table.amount} >= 0
      ) OR (
        ${table.valueStatus} <> 'PRESENT'
        AND ${table.amount} IS NULL
      )`,
    ),
  ],
);
