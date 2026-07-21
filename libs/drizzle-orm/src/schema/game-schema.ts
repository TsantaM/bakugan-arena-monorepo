import { pgTable, text, timestamp, boolean, pgEnum, uuid, jsonb } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { user } from "./auth-schema.js"
import { type replayDataType } from "@bakugan-arena/game-data"
import type { BotScoreWeights, BotTrainingMetrics } from "../bot-score-weights.js"

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

    ranked: boolean("ranked").default(false).notNull(),

    winner: text("winner"),
    looser: text("looser"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
})

// ================== REPLAYS TABLE ==================
export const replay = pgTable("replay", {
    id: uuid("id").primaryKey().defaultRandom(),

    title: text("title").notNull(),

    roomId: uuid("room_id")
        .notNull()
        .unique()
        .references(() => rooms.id, { onDelete: "cascade" }),

    replayData: jsonb("replay_data")
        .$type<replayDataType>()
        .notNull(),

    createdAt: timestamp("created_at")
        .defaultNow()
        .notNull(),
})

export const replayRelations = relations(replay, ({ one }) => ({
    room: one(rooms, {
        fields: [replay.roomId],
        references: [rooms.id],
    }),
}))

export const roomsRelations = relations(rooms, ({ one }) => ({
    replay: one(replay, {
        fields: [rooms.id],
        references: [replay.roomId],
    }),
}))

// ================== BOT TRAINING ==================
export const botTrainingItem = pgTable("bot_training_item", {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    source: text("source").notNull(), // 'database' | 'import'
    replayId: uuid("replay_id").references(() => replay.id, { onDelete: "set null" }),
    roomId: uuid("room_id"),
    replayData: jsonb("replay_data").$type<replayDataType>().notNull(),
    learnFromUserId: text("learn_from_user_id").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const botScoreWeights = pgTable("bot_score_weights", {
    id: uuid("id").primaryKey().defaultRandom(),
    version: text("version").notNull(),
    label: text("label").notNull(),
    weights: jsonb("weights").$type<BotScoreWeights>().notNull(),
    metrics: jsonb("metrics").$type<BotTrainingMetrics>().notNull(),
    isActive: boolean("is_active").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
})
