import * as THREE from "three"
import {
    ENABLE_V4_BOARD_ANCHOR,
    ENABLE_V4_GALAXY_BACKGROUND,
    ENABLE_V4_STARFIELD,
} from "../config/feature-flags"
import { createBattlefieldBackground } from "./battlefield-background"
import { createBoardAnchor } from "./board-anchor"
import { createLegacyBoardBackground } from "./legacy-board-background"
import { createStarfield } from "./starfield"

export type BoardEnvironmentHandle = {
    /** Object holding the whole environment, to keep across board rebuilds. */
    group: THREE.Object3D
    dispose: () => void
}

type Layer = {
    group: THREE.Object3D
    update?: (delta: number) => void
    dispose: () => void
}

/**
 * The board environment, assembled from independently toggled layers:
 * the background (V4 galaxies or the previous tiled floor), the starfield and
 * the board anchor glow.
 *
 * Entry points call this one function; nothing else has to know which parts are
 * active. Everything ends up under a single group, so a board rebuild keeps it.
 */
export function createBoardEnvironment(
    scene: THREE.Scene,
    { camera }: { camera?: THREE.PerspectiveCamera } = {},
): BoardEnvironmentHandle {
    const root = new THREE.Group()
    root.name = "board-environment"
    scene.add(root)

    const layers: Layer[] = []

    layers.push(
        ENABLE_V4_GALAXY_BACKGROUND
            ? createBattlefieldBackground(scene, { camera })
            : createLegacyBoardBackground(scene),
    )

    if (ENABLE_V4_STARFIELD) layers.push(createStarfield(scene))
    if (ENABLE_V4_BOARD_ANCHOR) layers.push(createBoardAnchor(scene))

    // Reparent under the single root so entry points only track one object.
    layers.forEach((layer) => root.add(layer.group))

    const animated = layers.filter(
        (layer): layer is Layer & { update: (delta: number) => void } =>
            typeof layer.update === "function",
    )

    const clock = new THREE.Clock()
    let frameId = 0
    let disposed = false

    // One shared loop for every animated layer (the galaxies drive their own).
    if (animated.length > 0) {
        const tick = () => {
            frameId = requestAnimationFrame(tick)
            // Capped: a backgrounded tab resumes with a huge delta otherwise.
            const delta = Math.min(clock.getDelta(), 0.1)
            animated.forEach((layer) => layer.update(delta))
        }
        frameId = requestAnimationFrame(tick)
    }

    return {
        group: root,
        dispose: () => {
            if (disposed) return
            disposed = true
            cancelAnimationFrame(frameId)
            layers.forEach((layer) => layer.dispose())
            root.removeFromParent()
            root.clear()
        },
    }
}
