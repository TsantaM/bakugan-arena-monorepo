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

    initialSlot.bakugans.filter((baks) => baks.userId === bakugan.userId).forEach((b) => {
        if (b.userId === bakugan.userId && b.key !== bakugan.key) {
            console.log('animation go')
            MoveBakugan({
                bakugan: b,
                scene: scene,
                slot: initialSlot,
                userId: userId
            })
        }

    })

    console.log('amimation gogo')
    await MoveBakugan({
        bakugan: bakugan,
        scene: scene,
        slot: newSlot,
        userId: userId
    })

    newSlot.bakugans.filter((baks) => baks.userId === bakugan.userId).forEach((b) => {
        if (b.userId === bakugan.userId && b.key !== bakugan.key) {
            MoveBakugan({
                bakugan: b,
                scene: scene,
                slot: newSlot,
                userId: userId
            })
        }

    })


}

export {
    MoveToAnotherSlotFunctionAnimation
}