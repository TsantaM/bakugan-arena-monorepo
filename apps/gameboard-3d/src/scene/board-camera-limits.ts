import * as THREE from "three"
import type { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"

/**
 * Highest polar angle the camera may reach: just short of the board plane, so
 * the player can skim the horizon but never look at the gate cards from below.
 */
export const MAX_BOARD_POLAR_ANGLE = Math.PI / 2 - 0.06

/**
 * Farthest the camera may dolly out. Must stay below the galaxies' own
 * `minDistance` (28) so a background galaxy can never end up between the
 * camera and the board.
 */
export const MAX_BOARD_CAMERA_DISTANCE = 24

/** Closest the camera may dolly in. */
export const MIN_BOARD_CAMERA_DISTANCE = 3

/** How far the pan target may leave the board center, for the same reason. */
export const MAX_BOARD_PAN_OFFSET = 8

/**
 * Keeps the camera above the board and framed on it: the player cannot look at
 * the gate cards from below, nor pan or zoom out far enough to get in between
 * the board and the drifting galaxies.
 */
export function applyBoardCameraLimits(controls: OrbitControls) {
    controls.maxPolarAngle = MAX_BOARD_POLAR_ANGLE
    controls.minDistance = MIN_BOARD_CAMERA_DISTANCE
    controls.maxDistance = MAX_BOARD_CAMERA_DISTANCE

    // OrbitControls has no pan bounds: clamp the target back into a box around
    // the board after each change.
    const correction = new THREE.Vector3()

    controls.addEventListener("change", () => {
        const { target } = controls
        const clampedX = Math.max(-MAX_BOARD_PAN_OFFSET, Math.min(MAX_BOARD_PAN_OFFSET, target.x))
        const clampedY = Math.max(-MAX_BOARD_PAN_OFFSET, Math.min(MAX_BOARD_PAN_OFFSET, target.y))
        const clampedZ = Math.max(-MAX_BOARD_PAN_OFFSET, Math.min(MAX_BOARD_PAN_OFFSET, target.z))

        if (clampedX === target.x && clampedY === target.y && clampedZ === target.z) return

        // Move the camera with the target so clamping never jerks the view.
        correction.set(clampedX - target.x, clampedY - target.y, clampedZ - target.z)
        controls.object.position.add(correction)
        target.set(clampedX, clampedY, clampedZ)
    })
}
