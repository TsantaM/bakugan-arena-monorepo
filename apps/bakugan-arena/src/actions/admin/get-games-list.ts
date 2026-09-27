'use server'

import { db } from "@/src/lib/db"
import { requireAdmin } from "../getUserSession"
import { schema } from "@bakugan-arena/drizzle-orm"
import { and, desc, gte, ilike, inArray, lte, or } from "drizzle-orm"

const { rooms, user } = schema

/** Identité d'un joueur telle qu'affichée dans la liste des parties. */
export type GameListPlayer = {
    id: string
    username: string | null
    displayUsername: string | null
}

export type GameListItem = {
    id: string
    playerOne: GameListPlayer
    playerTwo: GameListPlayer
    winner: GameListPlayer | null
    loser: GameListPlayer | null
    finished: boolean
    ranked: boolean
    createdAt: Date
}

export type GamesListFilters = {
    /** Date de début, incluse. `YYYY-MM-DD` est interprété au début de la journée locale. */
    from?: string | null
    /** Date de fin, incluse. `YYYY-MM-DD` couvre la journée entière. */
    to?: string | null
    /** Recherche sur le pseudo de l'un des deux joueurs. */
    playerQuery?: string | null
    limit?: number
}

const DEFAULT_LIMIT = 50
const MAX_LIMIT = 200

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/

/**
 * Convertit une borne de filtre en `Date`.
 *
 * Un `<input type="date">` renvoie `YYYY-MM-DD`, que `new Date()` interpréterait
 * à minuit UTC : filtrer `createdAt <= 2026-09-27` exclurait alors toute la
 * journée du 27. On étend donc une date seule aux bornes de la journée locale,
 * ce qui correspond à ce qu'un humain attend d'un filtre « du … au … ».
 */
function parseBoundary(value: string | null | undefined, edge: 'start' | 'end'): Date | null {
    if (!value) return null

    const trimmed = value.trim()
    if (!trimmed) return null

    if (DATE_ONLY.test(trimmed)) {
        const [year, month, day] = trimmed.split('-').map(Number)

        return edge === 'start'
            ? new Date(year, month - 1, day, 0, 0, 0, 0)
            : new Date(year, month - 1, day, 23, 59, 59, 999)
    }

    const parsed = new Date(trimmed)
    return Number.isNaN(parsed.getTime()) ? null : parsed
}

/** Les identifiants des joueurs dont le pseudo correspond à la recherche. */
async function findPlayerIds(playerQuery: string): Promise<string[]> {
    const pattern = `%${playerQuery}%`

    const matches = await db.query.user.findMany({
        where: or(
            ilike(user.displayUsername, pattern),
            ilike(user.username, pattern),
            ilike(user.name, pattern),
        ),
        columns: { id: true },
    })

    return matches.map((match) => match.id)
}

/**
 * Liste les parties de la table `rooms`, les plus récentes d'abord.
 *
 * Les pseudos sont résolus en une seule requête pour l'ensemble des parties
 * retournées : une recherche par partie ferait exploser le nombre de requêtes
 * (deux par ligne) sans rien apporter.
 */
export async function getGamesList(filters: GamesListFilters = {}): Promise<GameListItem[]> {
    await requireAdmin()

    const limit = Math.min(Math.max(filters.limit ?? DEFAULT_LIMIT, 1), MAX_LIMIT)

    const conditions = []

    const from = parseBoundary(filters.from, 'start')
    if (from) conditions.push(gte(rooms.createdAt, from))

    const to = parseBoundary(filters.to, 'end')
    if (to) conditions.push(lte(rooms.createdAt, to))

    const playerQuery = filters.playerQuery?.trim()
    if (playerQuery) {
        const playerIds = await findPlayerIds(playerQuery)

        // Aucun joueur ne correspond : inutile d'interroger les parties.
        if (playerIds.length === 0) return []

        conditions.push(
            or(
                inArray(rooms.player1Id, playerIds),
                inArray(rooms.player2Id, playerIds),
            ),
        )
    }

    const roomRows = await db
        .select({
            id: rooms.id,
            player1Id: rooms.player1Id,
            player2Id: rooms.player2Id,
            finished: rooms.finished,
            ranked: rooms.ranked,
            winner: rooms.winner,
            looser: rooms.looser,
            createdAt: rooms.createdAt,
        })
        .from(rooms)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(rooms.createdAt))
        .limit(limit)

    if (roomRows.length === 0) return []

    const playerIds = [
        ...new Set(roomRows.flatMap((room) => [room.player1Id, room.player2Id])),
    ]

    const players = await db.query.user.findMany({
        where: inArray(user.id, playerIds),
        columns: { id: true, username: true, displayUsername: true },
    })

    const playersById = new Map(players.map((player) => [player.id, player]))

    /**
     * Un compte supprimé ne doit pas faire disparaître la partie de la liste :
     * on retombe sur l'identifiant, que le tableau sait afficher.
     */
    const resolvePlayer = (id: string): GameListPlayer => {
        const player = playersById.get(id)

        return {
            id,
            username: player?.username ?? null,
            displayUsername: player?.displayUsername ?? null,
        }
    }

    return roomRows.map((room) => {
        const playerOne = resolvePlayer(room.player1Id)
        const playerTwo = resolvePlayer(room.player2Id)

        const byId = (id: string | null) =>
            id === null ? null : id === playerOne.id ? playerOne : id === playerTwo.id ? playerTwo : resolvePlayer(id)

        return {
            id: room.id,
            playerOne,
            playerTwo,
            winner: byId(room.winner),
            loser: byId(room.looser),
            finished: room.finished,
            ranked: room.ranked,
            createdAt: room.createdAt,
        }
    })
}
