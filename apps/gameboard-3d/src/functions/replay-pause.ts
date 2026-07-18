import gsap from "gsap"

let paused = true
let resolvers: Array<() => void> = []

export function isReplayPaused() {
    return paused
}

export function setReplayPaused(value: boolean) {
    if (paused === value) return
    paused = value

    if (paused) {
        gsap.globalTimeline.pause()
    } else {
        gsap.globalTimeline.resume()
        const waiting = resolvers
        resolvers = []
        waiting.forEach((resolve) => resolve())
    }
}

/** Bloque tant que le replay est en pause (entre deux entrées / avant une anim). */
export function waitWhilePaused(): Promise<void> {
    if (!paused) return Promise.resolve()
    return new Promise((resolve) => {
        resolvers.push(resolve)
    })
}
