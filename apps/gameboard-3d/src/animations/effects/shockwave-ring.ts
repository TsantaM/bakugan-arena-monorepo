import gsap from "gsap"
import * as THREE from "three"

export type ShockwaveRingOptions = {
    scene: THREE.Scene
    /** Center of the blast. */
    position: THREE.Vector3
    color?: THREE.ColorRepresentation
    /** Radius the ring reaches. */
    radius?: number
    /** Number of rings; extra ones follow with a delay. */
    count?: number
    duration?: number
}

export type ShockwaveRingHandle = {
    done: Promise<void>
    dispose: () => void
}

/**
 * Flat expanding rings on the board: the ground wave of an explosion.
 */
export function playShockwaveRing({
    scene,
    position,
    color = 0xffd08a,
    radius = 4.5,
    count = 2,
    duration = 0.6,
}: ShockwaveRingOptions): ShockwaveRingHandle {
    const rings = Array.from({ length: count }, () => {
        const mesh = new THREE.Mesh(
            new THREE.RingGeometry(0.85, 1, 48),
            new THREE.MeshBasicMaterial({
                color,
                transparent: true,
                opacity: 0,
                side: THREE.DoubleSide,
                depthWrite: false,
                blending: THREE.AdditiveBlending,
            }),
        )
        // Flat on the board, just above it.
        mesh.rotation.x = -Math.PI / 2
        mesh.position.copy(position).setY(0.02)
        mesh.scale.setScalar(0.2)
        scene.add(mesh)
        return mesh
    })

    const done = Promise.all(
        rings.map(
            (ring, index) =>
                new Promise<void>((resolve) => {
                    const delay = index * 0.18
                    gsap.to(ring.scale, {
                        x: radius,
                        y: radius,
                        z: radius,
                        duration,
                        delay,
                        ease: "power2.out",
                    })
                    gsap.fromTo(
                        ring.material,
                        { opacity: 0.9 },
                        {
                            opacity: 0,
                            duration,
                            delay,
                            ease: "power2.out",
                            onComplete: resolve,
                        },
                    )
                }),
        ),
    ).then(() => undefined)

    return {
        done,
        dispose: () => {
            for (const ring of rings) {
                gsap.killTweensOf(ring.scale)
                gsap.killTweensOf(ring.material)
                ring.removeFromParent()
                ring.geometry.dispose()
                ring.material.dispose()
            }
            rings.length = 0
        },
    }
}
