DO $$
BEGIN
	IF EXISTS (
		SELECT 1
		FROM "assignments"
		GROUP BY "permit_id"
		HAVING COUNT(*) FILTER (WHERE "active" = true) <> 1
	) THEN
		RAISE EXCEPTION 'Cannot migrate assignments without exactly one active user per assigned permit';
	END IF;
END $$;--> statement-breakpoint
DELETE FROM "assignments" WHERE "active" = false;--> statement-breakpoint
UPDATE "permits"
SET "sync_status" = 'assigned', "updated_at" = NOW()
WHERE "sync_status" = 'created'
	AND EXISTS (
		SELECT 1 FROM "assignments"
		WHERE "assignments"."permit_id" = "permits"."id"
	);--> statement-breakpoint
UPDATE "permits"
SET "sync_status" = 'created', "updated_at" = NOW()
WHERE "sync_status" = 'assigned'
	AND NOT EXISTS (
		SELECT 1 FROM "assignments"
		WHERE "assignments"."permit_id" = "permits"."id"
	);--> statement-breakpoint
DROP INDEX "assignments_season_community_user_permit_unique";--> statement-breakpoint
DROP INDEX "assignments_active_permit_unique";--> statement-breakpoint
CREATE UNIQUE INDEX "assignments_permit_unique" ON "assignments" USING btree ("permit_id");--> statement-breakpoint
ALTER TABLE "assignments" DROP COLUMN "position";--> statement-breakpoint
ALTER TABLE "assignments" DROP COLUMN "active";
