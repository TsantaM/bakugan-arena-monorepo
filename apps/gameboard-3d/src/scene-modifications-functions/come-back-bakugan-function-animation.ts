import * as THREE from 'three'
import { ComeBackBakuganAnimation } from '../animations/come-back-bakugan-animation'
import type { bakuganOnSlot, portalSlotsTypeElement } from '@bakugan-arena/game-data'
import { MoveBakugan } from '../animations/move-bakugan-animation'

type ComeBackBakuganFunctionAnimationProps = {
    bakugan: bakuganOnSlot,
    camera: THREE.PerspectiveCamera,
    scene: THREE.Scene<THREE.Object3DEventMap>,
    slot: portalSlotsTypeElement,
    userId: string,
    bakugansMeshs: THREE.Sprite<THREE.Object3DEventMap>[]
}

async function ComeBackBakuganFunctionAnimation({ bakugan, camera, scene, slot, userId, bakugansMeshs }: ComeBackBakuganFunctionAnimationProps) {
    const slotAfterComeBack: portalSlotsTypeElement = {
        ...slot,
        bakugans: slot.bakugans.filter(
            (b) => !(b.key === bakugan.key && b.userId === bakugan.userId)
        ),
    }

    const reajustSpritesPositions = async () => {
        const remaining = slotAfterComeBack.bakugans.filter(
            (b) => b.userId === bakugan.userId
        )
        await Promise.all(
            remaining.map((b) =>
                MoveBakugan({
                    bakugan: b,
                    scene: scene,
                    slot: slotAfterComeBack,
                    userId: userId
                })
            )
        )
    }
    
    await ComeBackBakuganAnimation({
        bakugan: bakugan,
        camera: camera,
        scene: scene,
        slot: slot,
        userId: userId,
        onCompleteFunction: reajustSpritesPositions,
        bakugansMeshs
    })

}


export {
    ComeBackBakuganFunctionAnimation
}
