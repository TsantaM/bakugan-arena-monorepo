import type { replaySnapshotType } from "../../type/replay-snapshot-types.js"
import type { deckType } from "../../type/room-types.js"
import { createEmptyPortalSlots } from "./create-empty-portal-slots.js"

export const SANDBOX_USER_ID = "sandbox-p1"
export const SANDBOX_OPPONENT_ID = "sandbox-p2"

export function createEmptySandboxDeck(userId: string): deckType {
    return {
        deckId: `sandbox-deck-${userId}`,
        userId,
        bakugans: [],
        abilities: [],
        gates: [],
    }
}

export function createEmptySandboxSnapshot(
    userId = SANDBOX_USER_ID,
    opponentId = SANDBOX_OPPONENT_ID,
): replaySnapshotType {
    return {
        turnState: {
            can_change_player_turn: true,
            turn: userId,
            previous_turn: opponentId,
            turnCount: 1,
            set_new_gate: true,
            set_new_bakugan: true,
            use_ability_card: true,
            ability_card_block: {
                blocked: false,
                turn: 0,
                reason: null,
            },
        },
        battleState: {
            battleInProcess: false,
            slot: null,
            turns: 0,
            paused: false,
        },
        portalSlots: createEmptyPortalSlots(),
        decksState: [
            createEmptySandboxDeck(userId),
            createEmptySandboxDeck(opponentId),
        ],
        eliminated: {
            user: 0,
            opponnent: 0,
        },
        timers: [
            { userId, timer: 5 * 60 },
            { userId: opponentId, timer: 5 * 60 },
        ],
        messages: [],
        finished: undefined,
    }
}
