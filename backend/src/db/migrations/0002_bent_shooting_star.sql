ALTER TABLE "permit_sync_versions" RENAME TO "permit_sync_attempts";--> statement-breakpoint
ALTER TABLE "permit_sync_attempts" RENAME COLUMN "id" TO "sync_attempt_id";--> statement-breakpoint
ALTER TABLE "permit_sync_attempts" DROP CONSTRAINT "permit_sync_versions_permit_id_permits_id_fk";
--> statement-breakpoint
ALTER TABLE "permit_sync_attempts" DROP CONSTRAINT "permit_sync_versions_submitted_by_user_id_users_id_fk";
--> statement-breakpoint
DROP INDEX "permit_sync_versions_permit_version_unique";--> statement-breakpoint
ALTER TABLE "permit_sync_attempts" ADD COLUMN "upload_hash" text;--> statement-breakpoint
ALTER TABLE "permit_sync_attempts" ADD CONSTRAINT "permit_sync_attempts_permit_id_permits_id_fk" FOREIGN KEY ("permit_id") REFERENCES "public"."permits"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "permit_sync_attempts" ADD CONSTRAINT "permit_sync_attempts_submitted_by_user_id_users_id_fk" FOREIGN KEY ("submitted_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "permit_sync_attempts_permit_version_unique" ON "permit_sync_attempts" USING btree ("permit_id","version");