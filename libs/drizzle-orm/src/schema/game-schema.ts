import { pgTable, text, timestamp, boolean, pgEnum, uuid } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { user } from "./auth-schema.js"

// ================== ENUM ROLES ==================
export const rolesEnum = pgEnum("roles", ["JOUEUR", "ADMIN", "GAMEDESIGNER"])

// ================== DECK TABLE ==================
export const deck = pgTable("deck", {
    id: uuid("id").primaryKey().defaultRandom(), // ✅ UUID natif PostgreSQL
    name: text("name").notNull(),
    userId: text("user_id")
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
    bakugans: text("bakugans").array().notNull().default([]),
    ability: text("ability").array().notNull().default([]),
    exclusiveAbilities: text("exclusive_abilities").array().notNull().default([]),
    gateCards: text("gate_cards").array().notNull().default([]),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()).notNull(),
})

export const deckRelations = relations(deck, ({ one }) => ({
  user: one(user, {
    fields: [deck.userId],
    references: [user.id],
  }),
}))

// ================== ROOMS TABLE ==================
export const rooms = pgTable("rooms", {
    id: uuid("id").primaryKey().defaultRandom(),

    player1Id: text("player1_id").notNull(),
    p1Deck: text("p1_deck").notNull(),

    player2Id: text("player2_id").notNull(),
    p2Deck: text("p2_deck").notNull(),

    finished: boolean("finished").default(false).notNull(),

    winner: text("winner"),
    looser: text("looser"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
})