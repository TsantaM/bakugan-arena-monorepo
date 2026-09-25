import * as THREE from 'three'
import { MoveBakugan } from '../animations/move-bakugan-animation'
import type { bakuganOnSlot, portalSlotsTypeElement } from '@bakugan-arena/game-data'
import { ElimineBakuganAnimation } from '../animations/elimine-bakugan-animation'
import { addEliminatedCircle } from '../functions/set-eliminated-circle'

/**
 * One more KO for that player. Delegates to `setEliminatedCircles` so the HTML
 * circles and the in-scene HUD can never drift apart.
 */
function updateEliminatedUI({
    currentUserId,
    bakuganUserId,
}: {
    currentUserId: string
    bakuganUserId: string
}) {
    addEliminatedCircle({ isLeft: currentUserId === bakuganUserId })
}

async function ElimineBakuganFunctionAnimation({ bakugan, scene, slot, userId, bakugansMeshs }: {
    scene: THREE.Scene, bakugan: bakuganOnSlot, slot: portalSlotsTypeElement, userId: string, bakugansMeshs: THREE.Sprite<THREE.Object3DEventMap>[]
}) {
    const slotAfterElim: portalSlotsTypeElement = {
        ...slot,
        bakugans: slot.bakugans.filter((b) => b.id !== bakugan.id),
    }

    await ElimineBakuganAnimation({
        bakugan: bakugan,
        scene: scene,
        slot: slot,
        userId: userId,
        bakugansMeshs,
        onCompleteFunction: async () => {
            const remaining = slotAfterElim.bakugans.filter(
                (b) => b.userId === bakugan.userId
            )
            await Promise.all(
                remaining.map((b) =>
                    MoveBakugan({
                        bakugan: b,
                        scene: scene,
                        slot: slotAfterElim,
                        userId: userId,
                    })
                )
            )
        },
    })

    updateEliminatedUI({
        bakuganUserId: bakugan.userId,
        currentUserId: userId
    })

}

export {
    ElimineBakuganFunctionAnimation,
    updateEliminatedUI
}
