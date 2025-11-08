import * as THREE from 'three'
import { MoveBakugan } from '../animations/move-bakugan-animation'
import type { bakuganOnSlot, portalSlotsTypeElement } from '@bakugan-arena/game-data'
import { ElimineBakuganAnimation } from '../animations/elimine-bakugan-animation'

function ElimineBakuganFunctionAnimation({ bakugan, scene, slot, userId }: { scene: THREE.Scene, bakugan: bakuganOnSlot, slot: portalSlotsTypeElement, userId: string }) {

    slot.bakugans.forEach((b) => console.log(b))

    ElimineBakuganAnimation({
        bakugan: bakugan,
        scene: scene,
        slot: slot,
        userId: userId,
        onCompleteFunction: () => {
            slot.bakugans.filter((baks) => baks.userId === bakugan.userId).forEach((b) => {
                if (b.userId === bakugan.userId && b.id !== bakugan.id) {
                    MoveBakugan({
                        bakugan: b,
                        scene: scene,
                        slot: slot,
                        userId: userId
                    })
                }

            })
        },
    })

}

export {
    ElimineBakuganFunctionAnimation
}