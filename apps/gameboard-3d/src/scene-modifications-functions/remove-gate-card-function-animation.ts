import * as THREE from 'three'
import { RemoveGateCardAnimation } from '../animations/remove-gate-card-animation'
import type { portalSlotsTypeElement } from '@bakugan-arena/game-data'
import { ComeBackBakuganAnimation } from '../animations/come-back-bakugan-animation'

type RemoveGateCardFunctionAnimationProps = {
    plane: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial, THREE.Object3DEventMap>,
    slot: portalSlotsTypeElement,
    userId: string,
    scene: THREE.Scene,
    camera: THREE.PerspectiveCamera
}

async function RemoveGateCardFunctionAnimation({ plane, slot, userId, scene, camera, }: RemoveGateCardFunctionAnimationProps) {

    async function gateCardRemover() {
        const mesh = plane.getObjectByName(slot.id)
        if (!mesh) return
        RemoveGateCardAnimation({
            mesh: mesh as THREE.Mesh<THREE.PlaneGeometry, THREE.MeshStandardMaterial, THREE.Object3DEventMap>
        })
    }

    if (slot.bakugans.length > 0) {
        slot.bakugans.forEach((b) => {
            ComeBackBakuganAnimation({
                bakugan: b,
                scene: scene,
                slot: slot,
                userId: userId,
                camera: camera,
                onCompleteFunction: gateCardRemover
            }
            )
        })
    } else {
        await gateCardRemover()
    }
}

export {
    RemoveGateCardFunctionAnimation
}