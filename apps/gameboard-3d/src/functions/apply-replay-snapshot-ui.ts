import type { replaySnapshotType } from "@bakugan-arena/game-data"
import { resolveEliminatedForPerspective } from "@bakugan-arena/game-data"
import { setEliminatedCircles } from "./set-eliminated-circle"
import { applyTimerSnapshots, setLocalTimerUserId } from "./player-timer-ui"

export function applyReplaySnapshotUi(snapshot: replaySnapshotType, perspectiveUserId: string) {
    // Toujours recalculer depuis decksState pour la perspective visuelle (player1),
    // car eliminated.* a pu être capturé avec un autre point de vue (players[0]).
    const eliminated = resolveEliminatedForPerspective(snapshot.decksState, perspectiveUserId)

    setEliminatedCircles({
        count: eliminated.user,
        isLeft: true,
    })

    setEliminatedCircles({
        count: eliminated.opponnent,
        isLeft: false,
    })

    const turnCounter = document.getElementById("turn-counter")
    if (turnCounter) {
        const battleTurn = snapshot.battleState.battleInProcess
            ? snapshot.battleState.turns
            : undefined
        const data = battleTurn !== undefined
            ? `${snapshot.turnState.turnCount}T (${battleTurn})`
            : `${snapshot.turnState.turnCount}T`
        turnCounter.textContent = data
    }

    setLocalTimerUserId(perspectiveUserId)
    applyTimerSnapshots(
        snapshot.timers.map((t) => ({
            userId: t.userId,
            timer: t.timer,
            deadlineAt: null,
            running: false,
        })),
    )
}
