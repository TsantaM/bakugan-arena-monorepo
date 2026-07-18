import type { replaySnapshotType } from "@bakugan-arena/game-data"
import { resolveEliminatedForPerspective } from "@bakugan-arena/game-data"
import { setEliminatedCircles } from "./set-eliminated-circle"
import dayjs from "dayjs"
import duration from "dayjs/plugin/duration"
import relativeTime from "dayjs/plugin/relativeTime"

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

    dayjs.extend(duration)
    dayjs.extend(relativeTime)

    snapshot.timers.forEach((timerData) => {
        const { userId: user, timer } = timerData
        const d = dayjs.duration(timer, "seconds")
        const time = `${String(d.minutes()).padStart(2, "0")}:${String(d.seconds()).padStart(2, "0")}`

        if (user === perspectiveUserId) {
            const timerElement = document.getElementById("left-timer")
            if (timerElement) timerElement.textContent = time
        } else {
            const timerElement = document.getElementById("right-timer")
            if (timerElement) timerElement.textContent = time
        }
    })
}
