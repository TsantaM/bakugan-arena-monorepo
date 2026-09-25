import * as THREE from "three"

export type LegacyBoardBackgroundHandle = {
    group: THREE.Object3D
    dispose: () => void
}

/**
 * Pre-V4 battlefield background: a large floor plane tiling the empty gate slot
 * texture, on a gray sky.
 *
 * Kept as the fallback of `createBoardEnvironment` so
 * `VITE_ENABLE_V4_GALAXY_BACKGROUND=false` restores the previous look exactly.
 */
export function createLegacyBoardBackground(scene: THREE.Scene): LegacyBoardBackgroundHandle {
    const texture = new THREE.TextureLoader().load("./images/cards/empty-gate-slot.jpg")
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping

    const planeSize = 500
    texture.repeat.set(planeSize / 4, planeSize / 6)
    texture.offset.set(0, 0)

    const bgPlane = new THREE.Mesh(
        new THREE.PlaneGeometry(planeSize, planeSize),
        new THREE.MeshBasicMaterial({
            map: texture,
            side: THREE.DoubleSide,
            color: new THREE.Color(0x226d80),
        }),
    )

    bgPlane.rotation.x = -Math.PI / 2
    bgPlane.position.set(4, -0.01, 2)

    scene.background = new THREE.Color(0x808080)
    scene.add(bgPlane)

    return {
        group: bgPlane,
        dispose: () => {
            bgPlane.removeFromParent()
            bgPlane.geometry.dispose()
            bgPlane.material.dispose()
            texture.dispose()
        },
    }
}
