import gsap from "gsap"
import {
    findNextTurnStart,
    findPrevTurnStart,
    getTurnStarts,
} from "@bakugan-arena/game-data"
import { isReplayPaused, wakePauseWaiters } from "./replay-pause"

export { findNextTurnStart, findPrevTurnStart, getTurnStarts }

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
