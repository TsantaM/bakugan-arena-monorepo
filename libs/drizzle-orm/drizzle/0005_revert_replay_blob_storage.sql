DELETE FROM "replay" WHERE "replay_data" IS NULL;--> statement-breakpoint
ALTER TABLE "replay" DROP COLUMN IF EXISTS "blob_url";--> statement-breakpoint
ALTER TABLE "replay" DROP COLUMN IF EXISTS "replay_meta";--> statement-breakpoint
ALTER TABLE "replay" ALTER COLUMN "replay_data" SET NOT NULL;
