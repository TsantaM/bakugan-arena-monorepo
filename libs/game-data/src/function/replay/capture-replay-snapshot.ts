import type { replaySnapshotType } from "../../type/replay-snapshot-types.js"
import type { Message, stateType } from "../../type/type-index.js"

function countEliminated(deck: stateType["decksState"], userId: string): number {
    return (
        deck
            .find((d) => d.userId === userId)
            ?.bakugans.filter((b) => b?.bakuganData.elimined).length ?? 0
    )
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
            text: `Game is over ! The winner is ${winnerName} : ${winnerName} : ${winner.newElo}(+${winner.bonus}) / ${loserName} : ${loser.newElo}(-${loser.malus})`,
            turn: state.turnState.turnCount,
        }
    }

    return {
        text: "Game is over ! Equality !",
        turn: state.turnState.turnCount,
    }
}

export function captureReplaySnapshot(
    state: stateType,
    perspectiveUserId: string
): replaySnapshotType {
    const opponentId = state.players.find((p) => p.userId !== perspectiveUserId)?.userId

    return {
        turnState: structuredClone(state.turnState),
        battleState: structuredClone(state.battleState),
        portalSlots: structuredClone(state.protalSlots),
        decksState: structuredClone(state.decksState),
        eliminated: {
            user: countEliminated(state.decksState, perspectiveUserId),
            opponnent: opponentId
                ? countEliminated(state.decksState, opponentId)
                : 0,
        },
        timers: state.players.map((player) => ({
            userId: player.userId,
            timer: player.timer,
        })),
        messages: structuredClone(state.messages),
        finished: buildFinishedMessage(state),
    }
}
