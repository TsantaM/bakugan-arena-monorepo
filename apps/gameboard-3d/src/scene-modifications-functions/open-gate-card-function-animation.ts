import type { portalSlotsTypeElement, slots_id } from "@bakugan-arena/game-data";
import * as THREE from 'three'
import { OpenGateCardAnimation } from "../animations/open-gate-card-animation";

async function OpenGateGateCardFunctionAnimation({ plane, slotId: id, slot }: { slotId: slots_id, plane: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial, THREE.Object3DEventMap>, slot: portalSlotsTypeElement }) {
    const mesh = plane.getObjectByName(id)
    if (!mesh) return
        await OpenGateCardAnimation({
            mesh: mesh as THREE.Mesh<THREE.PlaneGeometry, THREE.MeshStandardMaterial, THREE.Object3DEventMap>,
            slot: slot
        })
}

export {
    OpenGateGateCardFunctionAnimation
}