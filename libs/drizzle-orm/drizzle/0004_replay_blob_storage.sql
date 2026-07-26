ALTER TABLE "replay" ALTER COLUMN "replay_data" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "replay" ADD COLUMN "blob_url" text;--> statement-breakpoint
ALTER TABLE "replay" ADD COLUMN "replay_meta" jsonb;
