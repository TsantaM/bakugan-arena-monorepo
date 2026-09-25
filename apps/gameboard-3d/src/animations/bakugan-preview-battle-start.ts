import type { bakuganOnSlot } from '@bakugan-arena/game-data'
import gsap from 'gsap'
import type * as THREE from 'three'
import { projectBakuganToScreen } from '../functions/project-to-screen'

/**
 * Entrance of a bakugan preview card at the start of a battle: it springs from
 * the bakugan it represents on the board and grows into place.
 *
 * Falls back to a slide from the board side when the bakugan mesh cannot be
 * projected (no camera registered yet, or sprite not in the scene).
 */
export async function BakuganPreviewOnBattleStartAnimation({
    container,
    bakugan,
    scene,
    isLeft,
}: {
    container: HTMLElement
    bakugan: bakuganOnSlot
    scene: THREE.Scene
    isLeft: boolean
}): Promise<void> {
    const destination = container.getBoundingClientRect()
    if (destination.width === 0) return

    const origin = projectBakuganToScreen(scene, bakugan)

    const from = origin
        ? {
              x: origin.x - (destination.left + destination.width / 2),
              y: origin.y - (destination.top + destination.height / 2),
          }
        : { x: isLeft ? window.innerWidth / 2.5 : -window.innerWidth / 2.5, y: 0 }

    return new Promise((resolve) => {
        gsap.fromTo(
            container,
            {
                x: from.x,
                y: from.y,
                // Not zero: the card reads as the bakugan growing, not as a
                // point expanding out of nothing.
                scale: 0.12,
                opacity: 0.35,
            },
            {
                x: 0,
                y: 0,
                scale: 1,
                opacity: 1,
                duration: 0.9,
                ease: 'back.out(1.1)',
                onComplete: () => {
                    // Leave no transform behind: later animations measure this
                    // element and append to it.
                    gsap.set(container, { clearProps: 'transform,opacity' })
                    resolve()
                },
            },
        )
    })
}
