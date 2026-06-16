CREATE TABLE "basic_info" (
	"id" text PRIMARY KEY NOT NULL,
	"permit_id" text NOT NULL,
	"department" text NOT NULL,
	"regional" text NOT NULL,
	"community" text NOT NULL,
	"site" text NOT NULL,
	"date" text NOT NULL,
	"is_completed" boolean NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cleaning_common_records" (
	"id" text PRIMARY KEY NOT NULL,
	"permit_id" text NOT NULL,
	"fleece_number" text NOT NULL,
	"gross_weight" double precision NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cleaning_headers" (
	"id" text PRIMARY KEY NOT NULL,
	"permit_id" text NOT NULL,
	"start_date" text NOT NULL,
	"end_date" text NOT NULL,
	"site" text NOT NULL,
	"supervisors" text NOT NULL,
	"is_completed" boolean NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dehearing_details" (
	"id" text PRIMARY KEY NOT NULL,
	"cleaning_common_id" text NOT NULL,
	"dehaired_weight" double precision NOT NULL,
	"bristle_weight" double precision NOT NULL,
	"has_dandruff" boolean NOT NULL,
	"dehairer_name" text NOT NULL,
	"signature" text NOT NULL,
	"is_completed" boolean NOT NULL
);
--> statement-breakpoint
CREATE TABLE "grooming_details" (
	"id" text PRIMARY KEY NOT NULL,
	"cleaning_common_id" text NOT NULL,
	"clean_weight" double precision NOT NULL,
	"dirty_weight" double precision NOT NULL,
	"total_weight" double precision NOT NULL,
	"is_completed" boolean NOT NULL
);
--> statement-breakpoint
CREATE TABLE "participants" (
	"id" text PRIMARY KEY NOT NULL,
	"permit_id" text NOT NULL,
	"name" text NOT NULL,
	"last_names" text NOT NULL,
	"gender" text NOT NULL,
	"identity_number" text NOT NULL,
	"signature" text NOT NULL,
	"notes" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "permits" (
	"id" text PRIMARY KEY NOT NULL,
	"date" text NOT NULL,
	"site" text NOT NULL,
	"authorization_code" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shearing_headers" (
	"id" text PRIMARY KEY NOT NULL,
	"permit_id" text NOT NULL,
	"site" text NOT NULL,
	"latitude" double precision NOT NULL,
	"longitude" double precision NOT NULL,
	"roundup_count" integer NOT NULL,
	"start_time" text NOT NULL,
	"end_time" text NOT NULL,
	"is_completed" boolean NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shearing_records" (
	"id" text PRIMARY KEY NOT NULL,
	"permit_id" text NOT NULL,
	"tag_number" integer NOT NULL,
	"sex" text NOT NULL,
	"age_category" text NOT NULL,
	"live_weight" double precision NOT NULL,
	"fiber_length" double precision NOT NULL,
	"body_condition" text NOT NULL,
	"gestation_status" text NOT NULL,
	"external_parasites" text NOT NULL,
	"mange_severity" text NOT NULL,
	"has_dandruff" boolean NOT NULL,
	"is_sheared" boolean NOT NULL,
	"is_dead" boolean NOT NULL,
	"observations" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "basic_info" ADD CONSTRAINT "basic_info_permit_id_permits_id_fk" FOREIGN KEY ("permit_id") REFERENCES "public"."permits"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cleaning_common_records" ADD CONSTRAINT "cleaning_common_records_permit_id_permits_id_fk" FOREIGN KEY ("permit_id") REFERENCES "public"."permits"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cleaning_headers" ADD CONSTRAINT "cleaning_headers_permit_id_permits_id_fk" FOREIGN KEY ("permit_id") REFERENCES "public"."permits"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dehearing_details" ADD CONSTRAINT "dehearing_details_cleaning_common_id_cleaning_common_records_id_fk" FOREIGN KEY ("cleaning_common_id") REFERENCES "public"."cleaning_common_records"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "grooming_details" ADD CONSTRAINT "grooming_details_cleaning_common_id_cleaning_common_records_id_fk" FOREIGN KEY ("cleaning_common_id") REFERENCES "public"."cleaning_common_records"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "participants" ADD CONSTRAINT "participants_permit_id_permits_id_fk" FOREIGN KEY ("permit_id") REFERENCES "public"."permits"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shearing_headers" ADD CONSTRAINT "shearing_headers_permit_id_permits_id_fk" FOREIGN KEY ("permit_id") REFERENCES "public"."permits"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shearing_records" ADD CONSTRAINT "shearing_records_permit_id_permits_id_fk" FOREIGN KEY ("permit_id") REFERENCES "public"."permits"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "basic_info_permit_id_unique" ON "basic_info" USING btree ("permit_id");--> statement-breakpoint
CREATE UNIQUE INDEX "cleaning_headers_permit_id_unique" ON "cleaning_headers" USING btree ("permit_id");--> statement-breakpoint
CREATE UNIQUE INDEX "dehearing_details_cleaning_common_id_unique" ON "dehearing_details" USING btree ("cleaning_common_id");--> statement-breakpoint
CREATE UNIQUE INDEX "grooming_details_cleaning_common_id_unique" ON "grooming_details" USING btree ("cleaning_common_id");--> statement-breakpoint
CREATE UNIQUE INDEX "shearing_headers_permit_id_unique" ON "shearing_headers" USING btree ("permit_id");