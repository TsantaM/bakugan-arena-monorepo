import * as THREE from "three"
import gsap from "gsap"
import type { CustomAnimationContext } from "./types"
import { getAttributColor } from "../../functions/get-attrubut-color"

const WAVE_COUNT = 4
const WAVE_STAGGER = 0.18
const WAVE_DURATION = 1.15
/** Covers the 12×12 plane and spills slightly past the edges. */
const MAX_SCALE = 18
const RING_INNER = 0.55
const RING_OUTER = 0.72

function createWaveRing(
    color: THREE.Color,
): THREE.Mesh<THREE.RingGeometry, THREE.MeshBasicMaterial> {
    const geometry = new THREE.RingGeometry(RING_INNER, RING_OUTER, 64)
    const material = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
    })
    const mesh = new THREE.Mesh(geometry, material)
    mesh.scale.setScalar(0.05)
    // Slight lift in plane-local Z so the ring sits above the board surface.
    mesh.position.z = 0.04
    return mesh
}

function disposeRing(
    mesh: THREE.Mesh<THREE.RingGeometry, THREE.MeshBasicMaterial>,
) {
    mesh.geometry.dispose()
    mesh.material.dispose()
}

export async function BarrageDeauAnimation({
    plane,
}: CustomAnimationContext): Promise<void> {
    const aquos = new THREE.Color(getAttributColor("Aquos"))
    const highlight = aquos.clone().lerp(new THREE.Color(0xffffff), 0.35)

    const rings = Array.from({ length: WAVE_COUNT }, (_, index) => {
        const color = index % 2 === 0 ? aquos : highlight
        const ring = createWaveRing(color)
        plane.add(ring)
        return ring
    })

    try {
        await Promise.all(
            rings.map(
                (ring, index) =>
                    new Promise<void>((resolve) => {
                        const delay = index * WAVE_STAGGER
                        const tl = gsap.timeline({
                            delay,
                            onComplete: resolve,
                        })

                        tl.to(
                            ring.material,
                            {
                                opacity: 0.85,
                                duration: 0.2,
                                ease: "power1.out",
                            },
                            0,
                        )

                        tl.to(
                            ring.scale,
                            {
                                x: MAX_SCALE,
                                y: MAX_SCALE,
                                z: 1,
                                duration: WAVE_DURATION,
                                ease: "power1.out",
                            },
                            0,
                        )

                        tl.to(
                            ring.material,
                            {
                                opacity: 0,
                                duration: WAVE_DURATION * 0.65,
                                ease: "power1.in",
                            },
                            WAVE_DURATION * 0.35,
                        )
                    }),
            ),
        )
    } finally {
        for (const ring of rings) {
            gsap.killTweensOf(ring.scale)
            gsap.killTweensOf(ring.material)
            plane.remove(ring)
            disposeRing(ring)
        }
    }
}
