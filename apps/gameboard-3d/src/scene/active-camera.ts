import type * as THREE from "three"

let activeCamera: THREE.PerspectiveCamera | null = null

/**
 * Camera currently rendering the board.
 *
 * Registered by every entry point so DOM animations can project a 3D position
 * to screen coordinates without threading the camera through every call site.
 */
export function setActiveCamera(camera: THREE.PerspectiveCamera) {
    activeCamera = camera
}

export function getActiveCamera(): THREE.PerspectiveCamera | null {
    return activeCamera
}
