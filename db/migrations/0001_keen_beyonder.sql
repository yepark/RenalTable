ALTER TABLE "food_nutrient" DROP CONSTRAINT "food_nutrient_source_record_id_food_source_record_id_fk";
--> statement-breakpoint
ALTER TABLE "food_import_log" ADD CONSTRAINT "food_import_log_id_source_unique" UNIQUE("id","source_id");--> statement-breakpoint
ALTER TABLE "food_source_record" ADD CONSTRAINT "food_source_record_id_food_unique" UNIQUE("id","food_id");--> statement-breakpoint
ALTER TABLE "food_nutrient" ADD CONSTRAINT "food_nutrient_source_food_fk" FOREIGN KEY ("source_record_id","food_id") REFERENCES "public"."food_source_record"("id","food_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "food_source_record" ADD CONSTRAINT "food_source_record_import_source_fk" FOREIGN KEY ("import_log_id","source_id") REFERENCES "public"."food_import_log"("id","source_id") ON DELETE restrict ON UPDATE no action;
