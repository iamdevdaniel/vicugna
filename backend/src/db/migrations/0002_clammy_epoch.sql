CREATE TABLE "communities" (
	"id" text PRIMARY KEY NOT NULL,
	"regional_id" text NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "departments" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "regionals" (
	"id" text PRIMARY KEY NOT NULL,
	"department_id" text NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "communities" ADD CONSTRAINT "communities_regional_id_regionals_id_fk" FOREIGN KEY ("regional_id") REFERENCES "public"."regionals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "regionals" ADD CONSTRAINT "regionals_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE no action ON UPDATE no action;