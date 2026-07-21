import * as THREE from 'three'
import { MoveBakugan } from '../animations/move-bakugan-animation'
import type { bakuganOnSlot, portalSlotsTypeElement } from '@bakugan-arena/game-data'
import { ElimineBakuganAnimation } from '../animations/elimine-bakugan-animation'

function updateEliminatedUI({
    currentUserId,
    bakuganUserId,
}: {
    currentUserId: string
    bakuganUserId: string
}) {


    const isLocalPlayer = currentUserId === bakuganUserId

    const selector = isLocalPlayer
        ? '.left-eliminated .circle.left-circle'
        : '.right-eliminated .circle.right-circle'

    const circles = Array.from(
        document.querySelectorAll<HTMLDivElement>(selector)
    )

    const targetCircle = isLocalPlayer
        // gauche → on part du dernier vivant
        ? [...circles].reverse().find(c => !c.classList.contains('dead'))
        // droite → on part du premier vivant
        : circles.find(c => !c.classList.contains('dead'))

    if (!targetCircle) {
        console.warn('Aucun cercle disponible à éliminer')
        return
    }

    targetCircle.classList.add('dead')
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
