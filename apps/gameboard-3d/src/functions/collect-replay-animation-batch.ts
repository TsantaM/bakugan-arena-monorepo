import type { AnimationDirectivesTypes, replayEntryType } from "@bakugan-arena/game-data"

/**
 * Collecte le batch d'animations à jouer pour une entrée replay,
 * en miroir de `playAnimation` (sockets-handlers) : les POWER_CHANGE
 * consécutifs sont regroupés et joués ensemble.
 */
export function collectReplayAnimationBatch(
    replay: replayEntryType[],
    startIndex: number
): { animations: AnimationDirectivesTypes[]; endIndex: number } {
    const start = replay[startIndex]
    if (!start?.animation) {
        return { animations: [], endIndex: startIndex }
    }

    const animations: AnimationDirectivesTypes[] = [start.animation]
    let endIndex = startIndex

    if (start.animation.type === "POWER_CHANGE") {
        while (
            endIndex + 1 < replay.length &&
            replay[endIndex + 1].animation?.type === "POWER_CHANGE"
        ) {
            endIndex++
            const next = replay[endIndex].animation
            if (next) animations.push(next)
        }
    }

    return { animations, endIndex }
}
