import gsap from "gsap"
import * as THREE from "three"
import { getAttributColor } from "../../functions/get-attrubut-color"

const DEFAULT_WAVE_COUNT = 5
const DROP_FALL_HEIGHT = 4.5

export type WaterDropImpactOptions = {
    scene: THREE.Scene
    /** Board plane that receives ripple rings in local space. */
    plane: THREE.Object3D
    /** World-space impact point (typically bakugan/board position). */
    impactWorld: THREE.Vector3
    /** Override Aquos color; defaults to attribute Aquos. */
    color?: THREE.Color
    waveCount?: number
    dropFallHeight?: number
}

export type WaterDropImpactHandle = {
    /** Resolves when ripple rings finish fading. */
    ripplesDone: Promise<void>
    dispose: () => void
}

function disposeMesh(mesh: THREE.Mesh) {
    mesh.geometry.dispose()
    ;(mesh.material as THREE.Material).dispose()
}

function tween(targets: gsap.TweenTarget, vars: gsap.TweenVars): Promise<void> {
    return new Promise((resolve) => {
        gsap.to(targets, {
            ...vars,
            onComplete: resolve,
        })
    })
}

function createWaveRing(
    color: THREE.Color,
): THREE.Mesh<THREE.RingGeometry, THREE.MeshBasicMaterial> {
    const geometry = new THREE.RingGeometry(0.45, 0.62, 64)
    const material = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
    })
    const mesh = new THREE.Mesh(geometry, material)
    mesh.scale.setScalar(0.04)
    mesh.position.z = 0.05
    return mesh
}

function createWaterDrop(color: THREE.Color): THREE.Mesh {
    const geometry = new THREE.SphereGeometry(0.22, 16, 16)
    const material = new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 1.4,
        transparent: true,
        opacity: 0.95,
        roughness: 0.15,
        metalness: 0.35,
    })
    return new THREE.Mesh(geometry, material)
}

function playRipples(
    plane: THREE.Object3D,
    origin: { x: number; y: number },
    aquos: THREE.Color,
    highlight: THREE.Color,
    waveCount: number,
): { rings: THREE.Mesh[]; promise: Promise<void> } {
    const rings = Array.from({ length: waveCount }, (_, index) => {
        const ring = createWaveRing(index % 2 === 0 ? aquos : highlight)
        ring.position.x = origin.x
        ring.position.y = origin.y
        plane.add(ring)
        return ring
    })

    const promise = Promise.all(
        rings.map(
            (ring, index) =>
                new Promise<void>((resolve) => {
                    const delay = index * 0.12
                    const tl = gsap.timeline({ delay, onComplete: resolve })
                    tl.to(ring.material, { opacity: 0.9, duration: 0.15, ease: "power1.out" }, 0)
                    tl.to(
                        ring.scale,
                        { x: 14, y: 14, z: 1, duration: 1.1, ease: "power1.out" },
                        0,
                    )
                    tl.to(
                        ring.material,
                        { opacity: 0, duration: 0.75, ease: "power1.in" },
                        0.35,
                    )
                }),
        ),
    ).then(() => undefined)

    return { rings, promise }
}

/**
 * Shared Aquos FX: a water drop falls, splats, and emits ripple rings.
 * Resolves after the splat; ripples keep running until `ripplesDone` / `dispose`.
 */
export async function playWaterDropImpact(
    options: WaterDropImpactOptions,
): Promise<WaterDropImpactHandle> {
    const aquos = options.color?.clone() ?? new THREE.Color(getAttributColor("Aquos"))
    const highlight = aquos.clone().lerp(new THREE.Color(0xffffff), 0.4)
    const waveCount = options.waveCount ?? DEFAULT_WAVE_COUNT
    const dropFallHeight = options.dropFallHeight ?? DROP_FALL_HEIGHT

    const drop = createWaterDrop(highlight)
    drop.position.set(
        options.impactWorld.x,
        options.impactWorld.y + dropFallHeight,
        options.impactWorld.z,
    )
    drop.scale.setScalar(0.2)
    options.scene.add(drop)

    const disposableMeshes: THREE.Mesh[] = [drop]

    const dispose = () => {
        for (const mesh of disposableMeshes) {
            gsap.killTweensOf(mesh.scale)
            gsap.killTweensOf(mesh.position)
            gsap.killTweensOf(mesh.material)
            mesh.parent?.remove(mesh)
            disposeMesh(mesh)
        }
        disposableMeshes.length = 0
    }

    await Promise.all([
        tween(drop.position, {
            y: 0.08,
            duration: 0.55,
            ease: "power2.in",
        }),
        tween(drop.scale, {
            x: 1,
            y: 1.35,
            z: 1,
            duration: 0.55,
            ease: "power1.in",
        }),
    ])

    const localImpact = options.plane.worldToLocal(options.impactWorld.clone())
    const ripples = playRipples(
        options.plane,
        { x: localImpact.x, y: localImpact.y },
        aquos,
        highlight,
        waveCount,
    )
    disposableMeshes.push(...ripples.rings)

    await Promise.all([
        tween(drop.material, { opacity: 0, duration: 0.2, ease: "power1.in" }),
        tween(drop.scale, {
            x: 2.4,
            y: 0.15,
            z: 2.4,
            duration: 0.2,
            ease: "power2.out",
        }),
    ])

    return {
        ripplesDone: ripples.promise,
        dispose,
    }
}
