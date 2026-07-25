-- V4 one-shot migration: apply on a database that matches the main (operational) schema.
-- Adds ranked rooms, replay storage, and bot training tables.
-- Idempotent: safe to re-run.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";--> statement-breakpoint

-- Defensive: elo exists in main TypeScript schema but may be missing if the DB was never pushed
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "elo" integer DEFAULT 1000 NOT NULL;--> statement-breakpoint

ALTER TABLE "rooms" ADD COLUMN IF NOT EXISTS "ranked" boolean DEFAULT false NOT NULL;--> statement-breakpoint

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
      FOREIGN KEY ("room_id") REFERENCES "rooms" ("id")
      ON DELETE CASCADE ON UPDATE NO ACTION;
  END IF;
END $$;--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "bot_training_item" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"source" text NOT NULL,
	"replay_id" uuid,
	"room_id" uuid,
	"replay_data" jsonb NOT NULL,
	"learn_from_user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "bot_score_weights" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"version" text NOT NULL,
	"label" text NOT NULL,
	"weights" jsonb NOT NULL,
	"metrics" jsonb NOT NULL,
	"is_active" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);--> statement-breakpoint

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'bot_training_item_replay_id_replay_id_fk'
  ) THEN
    ALTER TABLE "bot_training_item"
      ADD CONSTRAINT "bot_training_item_replay_id_replay_id_fk"
      FOREIGN KEY ("replay_id") REFERENCES "replay" ("id")
      ON DELETE SET NULL ON UPDATE NO ACTION;
  END IF;
END $$;
