import * as THREE from 'three'
import { RemoveGateCardAnimation } from '../animations/remove-gate-card-animation'
import type { portalSlotsTypeElement } from '@bakugan-arena/game-data'

type RemoveGateCardFunctionAnimationProps = {
    plane: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial, THREE.Object3DEventMap>,
    slot: portalSlotsTypeElement,
    userId: string,
    scene: THREE.Scene,
    camera: THREE.PerspectiveCamera,
    gateCardMeshs: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshStandardMaterial, THREE.Object3DEventMap>[],
    bakugansMeshs: THREE.Sprite<THREE.Object3DEventMap>[]
}

async function RemoveGateCardFunctionAnimation({ plane, slot, gateCardMeshs }: RemoveGateCardFunctionAnimationProps) {
    // COME_BACK_BAKUGAN is already played as its own directive before REMOVE_GATE_CARD.
    // Animate/remove every mesh named after this slot (guards against leftover duplicates).
    const meshes = plane.children.filter(
        (child): child is THREE.Mesh<THREE.PlaneGeometry, THREE.MeshStandardMaterial, THREE.Object3DEventMap> =>
            child.name === slot.id && (child as THREE.Mesh).isMesh
    )

    if (meshes.length === 0) return

    await Promise.all(
        meshes.map((mesh) =>
            RemoveGateCardAnimation({
                mesh,
                gateCardMeshs,
            })
        )
    )
}

export {
    RemoveGateCardFunctionAnimation
}
