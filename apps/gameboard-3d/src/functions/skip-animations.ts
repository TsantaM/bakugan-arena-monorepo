import gsap from "gsap"

let skipRequested = false
let animationsActive = false

export function setAnimationsActive(active: boolean) {
    animationsActive = active
    if (!active) {
        clearAnimationSkip()
    }
}

export function isAnimationSkipRequested() {
    return skipRequested
}

export function clearAnimationSkip() {
    skipRequested = false
    gsap.globalTimeline.timeScale(1)
}

/** Accélère / termine immédiatement les tweens en cours et les suivantes de la file. */
export function requestSkipAnimations() {
    if (!animationsActive) return

    skipRequested = true
    gsap.globalTimeline.timeScale(100)

    gsap.globalTimeline.getChildren(true, true, true).forEach((tween) => {
        try {
            tween.totalProgress(1)
        } catch {
            // ignore tweens déjà terminés
        }
    })
}

export function applySkipTimeScaleIfNeeded() {
    if (skipRequested) {
        gsap.globalTimeline.timeScale(100)
    }
}
