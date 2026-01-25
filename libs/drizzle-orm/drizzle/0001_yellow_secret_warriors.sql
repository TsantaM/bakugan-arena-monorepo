CREATE TYPE "public"."roles" AS ENUM('JOUEUR', 'ADMIN', 'GAMEDESIGNER');--> statement-breakpoint
CREATE TABLE "deck" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"user_id" text NOT NULL,
	"bakugans" text[] DEFAULT '{}' NOT NULL,
	"ability" text[] DEFAULT '{}' NOT NULL,
	"exclusive_abilities" text[] DEFAULT '{}' NOT NULL,
	"gate_cards" text[] DEFAULT '{}' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rooms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"player1_id" text NOT NULL,
	"p1_deck" text NOT NULL,
	"player2_id" text NOT NULL,
	"p2_deck" text NOT NULL,
	"finished" boolean DEFAULT false NOT NULL,
	"winner" text,
	"looser" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "role" "roles" DEFAULT 'JOUEUR' NOT NULL;--> statement-breakpoint
ALTER TABLE "deck" ADD CONSTRAINT "deck_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;