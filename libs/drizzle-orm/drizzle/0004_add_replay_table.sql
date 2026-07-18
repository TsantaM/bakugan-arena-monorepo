-- Add replay table expected by the ORM schema
CREATE EXTENSION IF NOT EXISTS "pgcrypto";--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "replay" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"room_id" uuid NOT NULL,
	"replay_data" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "replay_room_id_unique" UNIQUE("room_id")
);--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'replay_room_id_rooms_id_fk'
  ) THEN
    ALTER TABLE "replay"
      ADD CONSTRAINT "replay_room_id_rooms_id_fk"
      FOREIGN KEY ("room_id") REFERENCES "rooms" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;
  END IF;
END $$;
