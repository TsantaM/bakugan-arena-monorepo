import type { bakuganOnSlot, slots_id } from "@bakugan-arena/game-data"
import type * as THREE from "three"

export type CustomAnimationContext = {
    scene: THREE.Scene
    camera: THREE.PerspectiveCamera
    plane: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial, THREE.Object3DEventMap>
    bakugansMeshs: THREE.Sprite<THREE.Object3DEventMap>[]
    gateCardMeshs: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshStandardMaterial, THREE.Object3DEventMap>[]
    userId: string
    data: {
        animationKey: string
        sourceBakugan?: bakuganOnSlot
        targetBakugans?: bakuganOnSlot[]
        slotId?: slots_id
        payload?: Record<string, unknown>
    }
}

export type CustomAnimFn = (ctx: CustomAnimationContext) => Promise<void>
