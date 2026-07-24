import type {
    bakuganOnSlot,
    portalSlotsTypeElement,
} from "@bakugan-arena/game-data"
import { Slots } from "@bakugan-arena/game-data"
import gsap from "gsap"
import * as THREE from "three"
import { getAttributColor } from "../../functions/get-attrubut-color"
import { GetSpritePosition } from "../../functions/get-sprite-position"
import { buildSpriteUserData } from "../../functions/mesh-status-user-data"
import { MoveBakugan } from "../move-bakugan-animation"
import type { CustomAnimationContext } from "./types"

const WAVE_COUNT = 5
const BAKUGAN_REST_Y = 0.75
const BAKUGAN_DIVE_Y = 0.12
const BAKUGAN_REST_SCALE = 2
/** Target ambient light intensity while the mirage is active. */
const DIMMED_LIGHT_INTENSITY = 0.35

function disposeMesh(mesh: THREE.Mesh) {
    mesh.geometry.dispose()
    ;(mesh.material as THREE.Material).dispose()
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

function isPortalSlot(value: unknown): value is portalSlotsTypeElement {
    return (
        !!value &&
        typeof value === "object" &&
        "id" in value &&
        "bakugans" in value &&
        Array.isArray((value as portalSlotsTypeElement).bakugans)
    )
}

function isBakugan(value: unknown): value is bakuganOnSlot {
    return (
        !!value &&
        typeof value === "object" &&
        "key" in value &&
        "userId" in value
    )
}

function tween(targets: gsap.TweenTarget, vars: gsap.TweenVars): Promise<void> {
    return new Promise((resolve) => {
        gsap.to(targets, {
            ...vars,
            onComplete: resolve,
        })
    })
}

function collectSceneLights(scene: THREE.Scene): THREE.Light[] {
    const lights: THREE.Light[] = []
    scene.traverse((object) => {
        if (object instanceof THREE.Light) lights.push(object)
    })
    return lights
}

/** Large textured floor plane (MeshBasicMaterial — not affected by lights). */
function findBackgroundPlane(scene: THREE.Scene): THREE.Mesh | null {
    let found: THREE.Mesh | null = null
    scene.traverse((object) => {
        if (!(object instanceof THREE.Mesh)) return
        const geometry = object.geometry
        if (!(geometry instanceof THREE.PlaneGeometry)) return
        if (geometry.parameters.width < 100) return
        found = object
    })
    return found
}

function playRipples(
    plane: THREE.Object3D,
    origin: { x: number; y: number },
    aquos: THREE.Color,
    highlight: THREE.Color,
): { rings: THREE.Mesh[]; promise: Promise<void> } {
    const rings = Array.from({ length: WAVE_COUNT }, (_, index) => {
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

export async function MirageAquatiqueAnimation({
    scene,
    plane,
    userId,
    data,
}: CustomAnimationContext): Promise<void> {
    const payload = data.payload ?? {}
    const bakugan = (isBakugan(payload.bakugan) ? payload.bakugan : data.sourceBakugan) ?? null
    const initialSlot = isPortalSlot(payload.initialSlot) ? payload.initialSlot : null
    const newSlot = isPortalSlot(payload.newSlot) ? payload.newSlot : null

    if (!bakugan || !initialSlot || !newSlot) return

    const bakuganMesh = scene.getObjectByName(`${bakugan.key}-${bakugan.userId}`)
    if (!bakuganMesh) return

    const aquos = new THREE.Color(getAttributColor("Aquos"))
    const highlight = aquos.clone().lerp(new THREE.Color(0xffffff), 0.4)

    const previousBackground =
        scene.background instanceof THREE.Color
            ? scene.background.clone()
            : new THREE.Color(0x808080)
    const dimmedBackground = previousBackground.clone().multiplyScalar(0.08)

    const lights = collectSceneLights(scene)
    const previousLightIntensities = lights.map((light) => light.intensity)

    const bgPlane = findBackgroundPlane(scene)
    const bgMaterial =
        bgPlane?.material instanceof THREE.MeshBasicMaterial ? bgPlane.material : null
    const previousBgPlaneColor = bgMaterial?.color.clone() ?? null
    const dimmedBgPlaneColor = previousBgPlaneColor?.clone().multiplyScalar(0.18) ?? null

    const drop = createWaterDrop(highlight)
    const startWorld = bakuganMesh.getWorldPosition(new THREE.Vector3())
    drop.position.set(startWorld.x, startWorld.y + 4.5, startWorld.z)
    drop.scale.setScalar(0.2)
    scene.add(drop)

    const dest = GetSpritePosition({
        slot: newSlot,
        userId,
        bakugan,
        slotIndex: Slots.indexOf(newSlot.id),
    })

    const disposableMeshes: THREE.Mesh[] = [drop]
    const material = (bakuganMesh as THREE.Sprite).material as THREE.SpriteMaterial

    const restoreLighting = () => {
        scene.background = previousBackground
        lights.forEach((light, index) => {
            light.intensity = previousLightIntensities[index]
        })
        if (bgMaterial && previousBgPlaneColor) {
            bgMaterial.color.copy(previousBgPlaneColor)
        }
    }

    try {
        // 1 — Strongly dim the scene (lights + background + floor texture)
        scene.background = dimmedBackground
        await Promise.all([
            ...lights.map((light) =>
                tween(light, {
                    intensity: DIMMED_LIGHT_INTENSITY,
                    duration: 0.45,
                    ease: "power2.inOut",
                }),
            ),
            ...(bgMaterial && dimmedBgPlaneColor
                ? [
                      tween(bgMaterial.color, {
                          r: dimmedBgPlaneColor.r,
                          g: dimmedBgPlaneColor.g,
                          b: dimmedBgPlaneColor.b,
                          duration: 0.45,
                          ease: "power2.inOut",
                      }),
                  ]
                : []),
        ])

        // 2 — Water drop falls + shockwave ripples
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

        const localImpact = plane.worldToLocal(startWorld.clone())
        const ripples = playRipples(
            plane,
            { x: localImpact.x, y: localImpact.y },
            aquos,
            highlight,
        )
        disposableMeshes.push(...ripples.rings)

        await Promise.all([
            tween(drop.material, { opacity: 0, duration: 0.2, ease: "power1.in" }),
            tween(drop.scale, { x: 2.4, y: 0.15, z: 2.4, duration: 0.2, ease: "power2.out" }),
        ])

        // 3 — Bakugan dives, travels, emerges at destination
        const alliesOnInitial = initialSlot.bakugans.filter(
            (b) => b.userId === bakugan.userId && b.key !== bakugan.key,
        )
        const slotWithoutMover: portalSlotsTypeElement = {
            ...initialSlot,
            bakugans: initialSlot.bakugans.filter(
                (b) => !(b.key === bakugan.key && b.userId === bakugan.userId),
            ),
        }

        await Promise.all(
            alliesOnInitial.map((ally) =>
                MoveBakugan({
                    bakugan: ally,
                    scene,
                    slot: slotWithoutMover,
                    userId,
                    duration: 0.45,
                }),
            ),
        )

        await Promise.all([
            tween(bakuganMesh.position, {
                y: BAKUGAN_DIVE_Y,
                duration: 0.35,
                ease: "power2.in",
            }),
            tween(bakuganMesh.scale, {
                x: BAKUGAN_REST_SCALE * 0.35,
                y: BAKUGAN_REST_SCALE * 0.2,
                z: 1,
                duration: 0.35,
                ease: "power2.in",
            }),
            tween(material, { opacity: 0.25, duration: 0.35, ease: "power2.in" }),
        ])

        if (dest) {
            await tween(bakuganMesh.position, {
                x: dest.x,
                z: dest.z,
                duration: 0.85,
                ease: "power1.inOut",
            })
        }

        await Promise.all([
            tween(bakuganMesh.position, {
                y: BAKUGAN_REST_Y,
                duration: 0.4,
                ease: "back.out(1.6)",
            }),
            tween(bakuganMesh.scale, {
                x: BAKUGAN_REST_SCALE,
                y: BAKUGAN_REST_SCALE,
                z: 1,
                duration: 0.4,
                ease: "back.out(1.4)",
            }),
            tween(material, { opacity: 1, duration: 0.35, ease: "power2.out" }),
        ])

        bakuganMesh.userData = buildSpriteUserData({
            ...bakugan,
            slot_id: newSlot.id,
        })

        const alliesOnNew = newSlot.bakugans.filter(
            (b) => b.userId === bakugan.userId && b.key !== bakugan.key,
        )
        await Promise.all(
            alliesOnNew.map((ally) =>
                MoveBakugan({
                    bakugan: ally,
                    scene,
                    slot: newSlot,
                    userId,
                    duration: 0.45,
                }),
            ),
        )

        await ripples.promise

        // 4 — Restore scene lighting
        await Promise.all([
            ...lights.map((light, index) =>
                tween(light, {
                    intensity: previousLightIntensities[index],
                    duration: 0.5,
                    ease: "power2.inOut",
                }),
            ),
            ...(bgMaterial && previousBgPlaneColor
                ? [
                      tween(bgMaterial.color, {
                          r: previousBgPlaneColor.r,
                          g: previousBgPlaneColor.g,
                          b: previousBgPlaneColor.b,
                          duration: 0.5,
                          ease: "power2.inOut",
                      }),
                  ]
                : []),
            tween(dimmedBackground, {
                r: previousBackground.r,
                g: previousBackground.g,
                b: previousBackground.b,
                duration: 0.5,
                ease: "power2.inOut",
                onUpdate: () => {
                    scene.background = dimmedBackground
                },
            }),
        ])
        scene.background = previousBackground
    } finally {
        lights.forEach((light) => gsap.killTweensOf(light))
        if (bgMaterial) gsap.killTweensOf(bgMaterial.color)
        restoreLighting()

        for (const mesh of disposableMeshes) {
            gsap.killTweensOf(mesh.scale)
            gsap.killTweensOf(mesh.position)
            gsap.killTweensOf(mesh.material)
            mesh.parent?.remove(mesh)
            disposeMesh(mesh)
        }

        gsap.killTweensOf(bakuganMesh.position)
        gsap.killTweensOf(bakuganMesh.scale)
        gsap.killTweensOf(material)
        material.opacity = 1
        bakuganMesh.scale.set(BAKUGAN_REST_SCALE, BAKUGAN_REST_SCALE, 1)
        bakuganMesh.position.y = BAKUGAN_REST_Y
        if (dest) {
            bakuganMesh.position.x = dest.x
            bakuganMesh.position.z = dest.z
        }
    }
}
