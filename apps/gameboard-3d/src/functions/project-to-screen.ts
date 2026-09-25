import * as THREE from "three"
import { getActiveCamera } from "../scene/active-camera"

const projected = new THREE.Vector3()

/**
 * Screen position (CSS pixels) of a world position, or `null` when it is behind
 * the camera or no camera is registered yet.
 *
 * The renderer always covers the whole window, so NDC map directly to the page.
 */
export function projectToScreen(
    position: THREE.Vector3,
    camera = getActiveCamera(),
): { x: number; y: number } | null {
    if (!camera) return null

    projected.copy(position).project(camera)
    if (projected.z > 1) return null

    return {
        x: ((projected.x + 1) / 2) * window.innerWidth,
        y: ((1 - projected.y) / 2) * window.innerHeight,
    }
}

/** Screen position of a bakugan sprite, looked up by its mesh name. */
export function projectBakuganToScreen(
    scene: THREE.Scene,
    bakugan: { key: string; userId: string },
): { x: number; y: number } | null {
    const mesh = scene.getObjectByName(`${bakugan.key}-${bakugan.userId}`)
    if (!mesh) return null

    return projectToScreen(mesh.getWorldPosition(new THREE.Vector3()))
}
