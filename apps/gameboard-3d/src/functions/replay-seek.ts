import gsap from "gsap"
import type { replayEntryType } from "@bakugan-arena/game-data"
import { isReplayPaused, wakePauseWaiters } from "./replay-pause"

let seekTarget: number | null = null
let seekAbortResolvers: Array<() => void> = []

export function peekSeekTarget() {
    return seekTarget
}

export function consumeSeekTarget() {
    const target = seekTarget
    seekTarget = null
    return target
}

export function waitForSeekAbort(): Promise<void> {
    return new Promise((resolve) => {
        seekAbortResolvers.push(resolve)
        // Si un seek est déjà en attente, ne pas rester bloqué
        if (seekTarget !== null) {
            notifySeekAbort()
        }
    })
}

function killActiveAnimations() {
    gsap.globalTimeline.getChildren(true, true, true).forEach((tween) => {
        tween.kill()
    })

    if (isReplayPaused()) {
        gsap.globalTimeline.pause()
    } else {
        gsap.globalTimeline.resume()
    }
}

function notifySeekAbort() {
    const waiting = seekAbortResolvers
    seekAbortResolvers = []
    waiting.forEach((resolve) => resolve())
}

export function requestReplaySeek(targetIndex: number) {
    seekTarget = targetIndex
    killActiveAnimations()
    wakePauseWaiters()
    notifySeekAbort()
}

/** Annule une lecture en cours sans cibler d'index (nouveau LOAD_REPLAY). */
export function abortReplayPlayback() {
    seekTarget = null
    killActiveAnimations()
    wakePauseWaiters()
    notifySeekAbort()
}

export function getTurnStarts(replay: replayEntryType[]): number[] {
    const starts = [0]
    for (let i = 0; i < replay.length; i++) {
        if (replay[i].marker === "turn_end" && i + 1 < replay.length) {
            starts.push(i + 1)
        }
    }
    return starts
}

export function findNextTurnStart(
    replay: replayEntryType[],
    currentIndex: number
): number | null {
    const starts = getTurnStarts(replay)
    return starts.find((start) => start > currentIndex) ?? null
}

export function findPrevTurnStart(
    replay: replayEntryType[],
    currentIndex: number
): number | null {
    const starts = getTurnStarts(replay)
    let currentStart = 0

    for (const start of starts) {
        if (start <= currentIndex) currentStart = start
        else break
    }

    // Au milieu d'un tour → début de ce tour ; déjà au début → tour précédent
    if (currentIndex > currentStart) return currentStart

    const idx = starts.indexOf(currentStart)
    if (idx <= 0) return null
    return starts[idx - 1]
}
