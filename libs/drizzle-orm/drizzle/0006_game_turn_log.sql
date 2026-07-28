CREATE TABLE IF NOT EXISTS "game_turn_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"room_id" uuid NOT NULL,
	"turn_number" integer NOT NULL,
	"turn_count" integer NOT NULL,
	"log_data" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "game_turn_log" ADD CONSTRAINT "game_turn_log_room_id_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."rooms"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "game_turn_log_room_turn_unique" ON "game_turn_log" USING btree ("room_id","turn_number");
