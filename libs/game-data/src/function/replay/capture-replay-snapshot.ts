import type { replaySnapshotType } from "../../type/replay-snapshot-types.js"
import type { Message, stateType } from "../../type/type-index.js"
import type { deckType } from "../../type/room-types.js"

export function countEliminatedFromDecks(decksState: deckType[], userId: string): number {
    return (
        decksState
            .find((d) => d.userId === userId)
            ?.bakugans.filter((b) => b?.bakuganData.elimined).length ?? 0
    )
}

/** Recalcule eliminated.user / opponnent pour une perspective donnée (lecture replay). */
export function resolveEliminatedForPerspective(
    decksState: deckType[],
    perspectiveUserId: string
): replaySnapshotType["eliminated"] {
    const opponentId = decksState.find((d) => d.userId !== perspectiveUserId)?.userId

    return {
        user: countEliminatedFromDecks(decksState, perspectiveUserId),
        opponnent: opponentId
            ? countEliminatedFromDecks(decksState, opponentId)
            : 0,
    }
}

function buildFinishedMessage(state: stateType): Message | undefined {
    if (!state.status.finished) return undefined

    if (state.status.winner !== null && state.status.elo !== null) {
        const winnerName =
            state.players.find((p) => p.userId === state.status.winner)?.username ?? ""
        const loserName =
            state.players.find((p) => p.userId !== state.status.winner)?.username ?? ""
        const { loser, winner } = state.status.elo

        return {
            key: 'game_over_winner_ranked',
            params: {
                winnerName,
                winnerElo: winner.newElo,
                winnerBonus: winner.bonus,
                loserName,
                loserElo: loser.newElo,
                loserMalus: loser.malus,
            },
            turn: state.turnState.turnCount,
        }
    }

    return {
        key: 'game_over_draw',
        turn: state.turnState.turnCount,
    }
}

/**
 * Vue *non clonée* de l'état, à la forme d'un snapshot de replay.
 *
 * À n'utiliser que comme source de comparaison immédiate (diff) : les sous-objets
 * sont les objets vivants de la room et continueront de muter.
 */
export function readReplaySnapshotView(
    state: stateType,
    perspectiveUserId: string
): replaySnapshotType {
    return {
        turnState: state.turnState,
        battleState: state.battleState,
        portalSlots: state.protalSlots,
        decksState: state.decksState,
        eliminated: resolveEliminatedForPerspective(state.decksState, perspectiveUserId),
        timers: state.players.map((player) => ({
            userId: player.userId,
            timer: player.timer,
        })),
        messages: state.messages,
        finished: buildFinishedMessage(state),
    }
}

export function captureReplaySnapshot(
    state: stateType,
    perspectiveUserId: string
): replaySnapshotType {
    return structuredClone(readReplaySnapshotView(state, perspectiveUserId))
}

export function createEmptyReplaySnapshot(): replaySnapshotType {
    return {
        turnState: {
            can_change_player_turn: true,
            turn: "",
            previous_turn: undefined,
            turnCount: 0,
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
        portalSlots: [],
        decksState: [],
        eliminated: { user: 0, opponnent: 0 },
        timers: [],
        messages: [],
        finished: undefined,
    }
}
