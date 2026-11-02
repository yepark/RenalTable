CREATE TYPE "public"."basis_unit" AS ENUM('G', 'ML', 'SERVING');--> statement-breakpoint
CREATE TYPE "public"."food_kind" AS ENUM('RAW', 'PROCESSED', 'DISH');--> statement-breakpoint
CREATE TYPE "public"."food_status" AS ENUM('DRAFT', 'REVIEWED', 'PUBLISHED', 'RETIRED');--> statement-breakpoint
CREATE TYPE "public"."food_import_status" AS ENUM('FETCHED', 'VALIDATED', 'NEEDS_REVIEW', 'APPROVED', 'PUBLISHED', 'FAILED');--> statement-breakpoint
CREATE TYPE "public"."nutrient_code" AS ENUM('ENERGY', 'PROTEIN', 'SODIUM', 'POTASSIUM', 'PHOSPHORUS', 'WATER');--> statement-breakpoint
CREATE TYPE "public"."nutrient_unit" AS ENUM('KCAL', 'G', 'MG', 'ML');--> statement-breakpoint
CREATE TYPE "public"."nutrient_value_status" AS ENUM('PRESENT', 'TRACE', 'BELOW_LIMIT', 'MISSING', 'NOT_APPLICABLE');--> statement-breakpoint
CREATE TYPE "public"."preparation_state" AS ENUM('UNKNOWN', 'RAW', 'BOILED', 'STEAMED', 'GRILLED', 'BAKED', 'FRIED', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."source_status" AS ENUM('ACTIVE', 'SUPERSEDED', 'UNAVAILABLE');--> statement-breakpoint
CREATE TYPE "public"."source_type" AS ENUM('FOOD_DB', 'GUIDELINE', 'RECIPE', 'OTHER');--> statement-breakpoint
CREATE TABLE "content_source" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"publisher" text NOT NULL,
	"title" text NOT NULL,
	"url" text NOT NULL,
	"source_type" "source_type" NOT NULL,
	"license_name" text,
	"license_url" text,
	"published_at" timestamp with time zone,
	"retrieved_at" timestamp with time zone NOT NULL,
	"content_hash" text NOT NULL,
	"status" "source_status" DEFAULT 'ACTIVE' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "content_source_publisher_not_blank" CHECK (length(btrim("content_source"."publisher")) > 0),
	CONSTRAINT "content_source_title_not_blank" CHECK (length(btrim("content_source"."title")) > 0),
	CONSTRAINT "content_source_url_not_blank" CHECK (length(btrim("content_source"."url")) > 0),
	CONSTRAINT "content_source_hash_not_blank" CHECK (length(btrim("content_source"."content_hash")) > 0)
);
--> statement-breakpoint
CREATE TABLE "food_import_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source_id" uuid NOT NULL,
	"started_at" timestamp with time zone NOT NULL,
	"finished_at" timestamp with time zone,
	"status" "food_import_status" NOT NULL,
	"schema_version" text NOT NULL,
	"normalizer_version" text NOT NULL,
	"raw_object_uri" text NOT NULL,
	"raw_sha256" text NOT NULL,
	"record_count" integer NOT NULL,
	"accepted_count" integer NOT NULL,
	"rejected_count" integer NOT NULL,
	"error_summary" text,
	"approved_by" text,
	"approved_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "food_import_log_counts_nonnegative" CHECK ("food_import_log"."record_count" >= 0 AND "food_import_log"."accepted_count" >= 0 AND "food_import_log"."rejected_count" >= 0),
	CONSTRAINT "food_import_log_counts_within_total" CHECK ("food_import_log"."accepted_count" + "food_import_log"."rejected_count" <= "food_import_log"."record_count"),
	CONSTRAINT "food_import_log_finished_after_started" CHECK ("food_import_log"."finished_at" IS NULL OR "food_import_log"."finished_at" >= "food_import_log"."started_at"),
	CONSTRAINT "food_import_log_sha256_format" CHECK ("food_import_log"."raw_sha256" ~ '^[0-9a-f]{64}$')
);
--> statement-breakpoint
CREATE TABLE "food_nutrient" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"food_id" uuid NOT NULL,
	"nutrient_id" uuid NOT NULL,
	"amount" numeric(18, 6),
	"unit" "nutrient_unit" NOT NULL,
	"basis_amount" numeric(18, 6) NOT NULL,
	"basis_unit" "basis_unit" NOT NULL,
	"value_status" "nutrient_value_status" NOT NULL,
	"source_record_id" uuid NOT NULL,
	"measured_at" timestamp with time zone,
	"source_updated_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "food_nutrient_observation_unique" UNIQUE("food_id","nutrient_id","source_record_id","basis_amount","basis_unit"),
	CONSTRAINT "food_nutrient_basis_positive" CHECK ("food_nutrient"."basis_amount" > 0),
	CONSTRAINT "food_nutrient_value_status_amount" CHECK ((
        "food_nutrient"."value_status" = 'PRESENT'
        AND "food_nutrient"."amount" IS NOT NULL
        AND "food_nutrient"."amount" >= 0
      ) OR (
        "food_nutrient"."value_status" <> 'PRESENT'
        AND "food_nutrient"."amount" IS NULL
      ))
);
--> statement-breakpoint
CREATE TABLE "food_source_record" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source_id" uuid NOT NULL,
	"import_log_id" uuid NOT NULL,
	"food_id" uuid,
	"external_id" text NOT NULL,
	"source_revision" text NOT NULL,
	"raw_payload" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "food_source_record_source_external_revision_unique" UNIQUE("source_id","external_id","source_revision"),
	CONSTRAINT "food_source_record_external_id_not_blank" CHECK (length(btrim("food_source_record"."external_id")) > 0),
	CONSTRAINT "food_source_record_revision_not_blank" CHECK (length(btrim("food_source_record"."source_revision")) > 0)
);
--> statement-breakpoint
CREATE TABLE "food" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"canonical_name_ko" text NOT NULL,
	"category_code" text NOT NULL,
	"food_kind" "food_kind" NOT NULL,
	"preparation_state" "preparation_state" DEFAULT 'UNKNOWN' NOT NULL,
	"default_basis_amount" numeric(18, 6) NOT NULL,
	"default_basis_unit" "basis_unit" NOT NULL,
	"status" "food_status" DEFAULT 'DRAFT' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"published_at" timestamp with time zone,
	CONSTRAINT "food_name_not_blank" CHECK (length(btrim("food"."canonical_name_ko")) > 0),
	CONSTRAINT "food_category_not_blank" CHECK (length(btrim("food"."category_code")) > 0),
	CONSTRAINT "food_default_basis_positive" CHECK ("food"."default_basis_amount" > 0),
	CONSTRAINT "food_published_at_required" CHECK ("food"."status" <> 'PUBLISHED' OR "food"."published_at" IS NOT NULL)
);
--> statement-breakpoint
CREATE TABLE "nutrient_definition" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" "nutrient_code" NOT NULL,
	"name_ko" text NOT NULL,
	"canonical_unit" "nutrient_unit" NOT NULL,
	"display_precision" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "nutrient_definition_code_unique" UNIQUE("code"),
	CONSTRAINT "nutrient_definition_name_not_blank" CHECK (length(btrim("nutrient_definition"."name_ko")) > 0),
	CONSTRAINT "nutrient_definition_precision_range" CHECK ("nutrient_definition"."display_precision" BETWEEN 0 AND 6)
);
--> statement-breakpoint
ALTER TABLE "food_import_log" ADD CONSTRAINT "food_import_log_source_id_content_source_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."content_source"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "food_nutrient" ADD CONSTRAINT "food_nutrient_food_id_food_id_fk" FOREIGN KEY ("food_id") REFERENCES "public"."food"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "food_nutrient" ADD CONSTRAINT "food_nutrient_nutrient_id_nutrient_definition_id_fk" FOREIGN KEY ("nutrient_id") REFERENCES "public"."nutrient_definition"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "food_nutrient" ADD CONSTRAINT "food_nutrient_source_record_id_food_source_record_id_fk" FOREIGN KEY ("source_record_id") REFERENCES "public"."food_source_record"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "food_source_record" ADD CONSTRAINT "food_source_record_source_id_content_source_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."content_source"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "food_source_record" ADD CONSTRAINT "food_source_record_import_log_id_food_import_log_id_fk" FOREIGN KEY ("import_log_id") REFERENCES "public"."food_import_log"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "food_source_record" ADD CONSTRAINT "food_source_record_food_id_food_id_fk" FOREIGN KEY ("food_id") REFERENCES "public"."food"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "food_import_log_source_started_idx" ON "food_import_log" USING btree ("source_id","started_at");--> statement-breakpoint
CREATE INDEX "food_nutrient_food_nutrient_idx" ON "food_nutrient" USING btree ("food_id","nutrient_id");--> statement-breakpoint
CREATE INDEX "food_nutrient_present_amount_idx" ON "food_nutrient" USING btree ("nutrient_id","amount") WHERE "food_nutrient"."value_status" = 'PRESENT';--> statement-breakpoint
CREATE INDEX "food_status_category_name_idx" ON "food" USING btree ("status","category_code","canonical_name_ko");