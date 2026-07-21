import type { bakuganOnSlot, portalSlotsTypeElement } from '@bakugan-arena/game-data'
import * as THREE from 'three'
import { MoveBakugan } from '../animations/move-bakugan-animation'

type MoveToAnotherSlotFunctionAnimationProps = {
    scene: THREE.Scene,
    initialSlot: portalSlotsTypeElement,
    newSlot: portalSlotsTypeElement,
    bakugan: bakuganOnSlot,
    userId: string
}

async function MoveToAnotherSlotFunctionAnimation({ scene, bakugan, initialSlot, newSlot, userId }: MoveToAnotherSlotFunctionAnimationProps) {
    const alliesOnInitial = initialSlot.bakugans.filter(
        (b) => b.userId === bakugan.userId && b.key !== bakugan.key
    )
    const slotWithoutMover: portalSlotsTypeElement = {
        ...initialSlot,
        bakugans: initialSlot.bakugans.filter(
            (b) => !(b.key === bakugan.key && b.userId === bakugan.userId)
        ),
    }

    await Promise.all(
        alliesOnInitial.map((b) =>
            MoveBakugan({
                bakugan: b,
                scene: scene,
                slot: slotWithoutMover,
                userId: userId
            })
        )
    )

    await MoveBakugan({
        bakugan: bakugan,
        scene: scene,
        slot: newSlot,
        userId: userId
    })

    const alliesOnNew = newSlot.bakugans.filter(
        (b) => b.userId === bakugan.userId && b.key !== bakugan.key
    )

    await Promise.all(
        alliesOnNew.map((b) =>
            MoveBakugan({
                bakugan: b,
                scene: scene,
                slot: newSlot,
                userId: userId
            })
        )
    )
}

export {
    MoveToAnotherSlotFunctionAnimation
}
