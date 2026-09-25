import type { bakuganOnSlot, slots_id } from "@bakugan-arena/game-data"
import * as THREE from "three"
import type { CustomAnimationContext } from "../../types"

/** World position of a bakugan sprite, or `null` when it is not in the scene. */
export function bakuganPosition(
    scene: THREE.Scene,
    bakugan: bakuganOnSlot,
): THREE.Vector3 | null {
    const mesh = scene.getObjectByName(`${bakugan.key}-${bakugan.userId}`)
    return mesh ? mesh.getWorldPosition(new THREE.Vector3()) : null
}

/** Sprite of a bakugan, for the effects that tint or scale it. */
export function bakuganMesh(scene: THREE.Scene, bakugan: bakuganOnSlot): THREE.Sprite | null {
    return (scene.getObjectByName(`${bakugan.key}-${bakugan.userId}`) as THREE.Sprite) ?? null
}

/** World position of a gate card, by slot id. */
export function gatePosition(
    plane: THREE.Object3D,
    slotId: slots_id | string,
): THREE.Vector3 | null {
    const mesh = plane.getObjectByName(slotId)
    return mesh ? mesh.getWorldPosition(new THREE.Vector3()) : null
}

/** Gate card of the slot the animation runs on, world position. */
export function currentGatePosition(ctx: CustomAnimationContext): THREE.Vector3 {
    const position = ctx.data.slotId ? gatePosition(ctx.plane, ctx.data.slotId) : null
    return position ?? new THREE.Vector3(0, 0, 0)
}
