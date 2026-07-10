CREATE TABLE "assignments" (
	"id" text PRIMARY KEY NOT NULL,
	"season_id" text NOT NULL,
	"community_id" text NOT NULL,
	"user_id" text NOT NULL,
	"permit_id" text NOT NULL,
	"active" boolean DEFAULT false NOT NULL,
	"assigned_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
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
CREATE TABLE "communities" (
	"id" text PRIMARY KEY NOT NULL,
	"regional_id" text NOT NULL,
	"name" text NOT NULL
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
CREATE TABLE "departments" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL
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
	"season_id" text NOT NULL,
	"community_id" text NOT NULL,
	"permit_number" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "regionals" (
	"id" text PRIMARY KEY NOT NULL,
	"department_id" text NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "seasons" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"start_date" text NOT NULL,
	"end_date" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
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
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"full_name" text NOT NULL,
	"phone_number" text NOT NULL,
	"email" text,
	"password_hash" text NOT NULL,
	"role" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"avatar_seed" text NOT NULL,
	"avatar_style" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_season_id_seasons_id_fk" FOREIGN KEY ("season_id") REFERENCES "public"."seasons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_community_id_communities_id_fk" FOREIGN KEY ("community_id") REFERENCES "public"."communities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_permit_id_permits_id_fk" FOREIGN KEY ("permit_id") REFERENCES "public"."permits"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "basic_info" ADD CONSTRAINT "basic_info_permit_id_permits_id_fk" FOREIGN KEY ("permit_id") REFERENCES "public"."permits"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cleaning_common_records" ADD CONSTRAINT "cleaning_common_records_permit_id_permits_id_fk" FOREIGN KEY ("permit_id") REFERENCES "public"."permits"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cleaning_headers" ADD CONSTRAINT "cleaning_headers_permit_id_permits_id_fk" FOREIGN KEY ("permit_id") REFERENCES "public"."permits"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "communities" ADD CONSTRAINT "communities_regional_id_regionals_id_fk" FOREIGN KEY ("regional_id") REFERENCES "public"."regionals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dehearing_details" ADD CONSTRAINT "dehearing_details_cleaning_common_id_cleaning_common_records_id_fk" FOREIGN KEY ("cleaning_common_id") REFERENCES "public"."cleaning_common_records"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "grooming_details" ADD CONSTRAINT "grooming_details_cleaning_common_id_cleaning_common_records_id_fk" FOREIGN KEY ("cleaning_common_id") REFERENCES "public"."cleaning_common_records"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "participants" ADD CONSTRAINT "participants_permit_id_permits_id_fk" FOREIGN KEY ("permit_id") REFERENCES "public"."permits"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "permits" ADD CONSTRAINT "permits_season_id_seasons_id_fk" FOREIGN KEY ("season_id") REFERENCES "public"."seasons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "permits" ADD CONSTRAINT "permits_community_id_communities_id_fk" FOREIGN KEY ("community_id") REFERENCES "public"."communities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "regionals" ADD CONSTRAINT "regionals_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shearing_headers" ADD CONSTRAINT "shearing_headers_permit_id_permits_id_fk" FOREIGN KEY ("permit_id") REFERENCES "public"."permits"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shearing_records" ADD CONSTRAINT "shearing_records_permit_id_permits_id_fk" FOREIGN KEY ("permit_id") REFERENCES "public"."permits"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "assignments_season_community_user_permit_unique" ON "assignments" USING btree ("season_id","community_id","user_id","permit_id");--> statement-breakpoint
CREATE UNIQUE INDEX "assignments_active_permit_unique" ON "assignments" USING btree ("permit_id") WHERE "assignments"."active" = true;--> statement-breakpoint
CREATE UNIQUE INDEX "basic_info_permit_id_unique" ON "basic_info" USING btree ("permit_id");--> statement-breakpoint
CREATE UNIQUE INDEX "cleaning_headers_permit_id_unique" ON "cleaning_headers" USING btree ("permit_id");--> statement-breakpoint
CREATE UNIQUE INDEX "dehearing_details_cleaning_common_id_unique" ON "dehearing_details" USING btree ("cleaning_common_id");--> statement-breakpoint
CREATE UNIQUE INDEX "grooming_details_cleaning_common_id_unique" ON "grooming_details" USING btree ("cleaning_common_id");--> statement-breakpoint
CREATE UNIQUE INDEX "permits_season_permit_number_unique" ON "permits" USING btree ("season_id","permit_number");--> statement-breakpoint
CREATE UNIQUE INDEX "shearing_headers_permit_id_unique" ON "shearing_headers" USING btree ("permit_id");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_unique" ON "users" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "users_phone_number_unique" ON "users" USING btree ("phone_number");
