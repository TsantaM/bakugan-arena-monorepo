import type { bakuganOnSlot, portalSlotsTypeElement } from "@bakugan-arena/game-data"
import { Slots } from "@bakugan-arena/game-data"
import gsap from "gsap"
import * as THREE from "three"
import { getAttributColor } from "../../functions/get-attrubut-color"
import { GetSpritePosition } from "../../functions/get-sprite-position"
import { createSprite } from "../../meshes/bakugan.mesh"
import { playSceneIlluminate } from "../effects"
import { MoveBakugan } from "../move-bakugan-animation"
import type { CustomAnimationContext } from "./types"

const BAKUGAN_REST_SCALE = 2
const BAKUGAN_REST_Y = 0.75

function isPortalSlot(value: unknown): value is portalSlotsTypeElement {
    return (
        !!value &&
        typeof value === "object" &&
        "id" in value &&
        "bakugans" in value &&
        Array.isArray((value as portalSlotsTypeElement).bakugans)
    )
}

function createGlowOrb(
    color: THREE.Color,
    size: number,
): THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial> {
    const geometry = new THREE.SphereGeometry(size, 24, 24)
    const material = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
    })
    return new THREE.Mesh(geometry, material)
}

function createLightPillar(color: THREE.Color): THREE.Mesh {
    const geometry = new THREE.CylinderGeometry(0.12, 0.45, 3.4, 16, 1, true)
    const material = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
    })
    const pillar = new THREE.Mesh(geometry, material)
    pillar.position.y = 1.7
    return pillar
}

/** Arrow built along +Y (head up), so it can be aimed with a single quaternion. */
function createArrow(core: THREE.Color, glow: THREE.Color): THREE.Group {
    const group = new THREE.Group()

    const shaftMaterial = new THREE.MeshBasicMaterial({
        color: core,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
    })
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.5, 12), shaftMaterial)

    const headMaterial = new THREE.MeshBasicMaterial({
        color: glow,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
    })
    const head = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.6, 14), headMaterial)
    head.position.y = 1.05

    const trailMaterial = new THREE.MeshBasicMaterial({
        color: glow,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
    })
    const trail = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.3, 2.2, 12, 1, true), trailMaterial)
    trail.position.y = -1.4

    group.add(shaft, head, trail)
    return group
}

function disposeObject(object: THREE.Object3D) {
    object.traverse((child) => {
        if (!(child instanceof THREE.Mesh)) return
        child.geometry.dispose()
        const material = child.material as THREE.Material | THREE.Material[]
        if (Array.isArray(material)) {
            material.forEach((m) => m.dispose())
        } else if (material) {
            material.dispose()
        }
    })
}

function collectMaterials(object: THREE.Object3D): THREE.Material[] {
    const materials: THREE.Material[] = []
    object.traverse((child) => {
        if (!(child instanceof THREE.Mesh)) return
        const material = child.material as THREE.Material | THREE.Material[]
        if (Array.isArray(material)) {
            materials.push(...material)
        } else if (material) {
            materials.push(material)
        }
    })
    return materials
}

function tween(targets: gsap.TweenTarget, vars: gsap.TweenVars): Promise<void> {
    return new Promise((resolve) => {
        gsap.to(targets, {
            ...vars,
            onComplete: resolve,
        })
    })
}

/**
 * Sagittarius Arrow —
 * 1) The caster radiates Haos light
 * 2) A light arrow takes off from the caster and crashes onto the gate card
 * 3) The impact floods the whole board with light
 * 4) The eliminated Haos allies materialize inside that light as reinforcements
 * Runs before the ADD_RENFORT power-HUD animations.
 */
export async function SagittariusArrowAnimation({
    scene,
    plane,
    userId,
    bakugansMeshs,
    gateCardMeshs,
    data,
}: CustomAnimationContext): Promise<void> {
    const source = data.sourceBakugan
    const payload = data.payload ?? {}
    const slot = isPortalSlot(payload.slot) ? payload.slot : null
    const renforts = data.targetBakugans ?? []

    if (!source || !slot || renforts.length === 0) return

    const slotIndex = Slots.indexOf(slot.id)
    if (slotIndex === -1) return

    const sourceMesh = scene.getObjectByName(
        `${source.key}-${source.userId}`,
    ) as THREE.Sprite | undefined
    if (!sourceMesh) return

    const haos = new THREE.Color(getAttributColor("Haos"))
    const white = new THREE.Color(0xffffff)
    const highlight = haos.clone().lerp(white, 0.6)

    const spriteMaterial = sourceMesh.material as THREE.SpriteMaterial
    const originalSpriteColor = spriteMaterial.color.clone()
    const sourceHomeScale = sourceMesh.scale.clone()

    // --- caster aura ---
    const casterInner = createGlowOrb(white, 0.4)
    const casterOuter = createGlowOrb(highlight, 0.85)
    const casterGroup = new THREE.Group()
    casterGroup.position.set(sourceMesh.position.x, BAKUGAN_REST_Y, sourceMesh.position.z)
    casterGroup.add(casterInner, casterOuter)
    casterInner.scale.setScalar(0.1)
    casterOuter.scale.setScalar(0.1)
    scene.add(casterGroup)

    // --- gate card target position (gate meshes live under the board plane) ---
    const gateMesh =
        gateCardMeshs.find((mesh) => mesh.name === slot.id) ?? plane.getObjectByName(slot.id)
    const gatePosition = new THREE.Vector3()
    if (gateMesh) {
        gateMesh.getWorldPosition(gatePosition)
    } else {
        gatePosition.set(sourceMesh.position.x, 0.2, sourceMesh.position.z)
    }
    gatePosition.y = Math.max(gatePosition.y, 0.2)

    const start = new THREE.Vector3(
        sourceMesh.position.x,
        sourceMesh.position.y + 0.3,
        sourceMesh.position.z,
    )

    const arrow = createArrow(white, highlight)
    const arrowMaterials = collectMaterials(arrow)
    arrow.position.copy(start)
    arrow.scale.setScalar(0.6)
    scene.add(arrow)

    // --- impact burst on the gate ---
    const impactInner = createGlowOrb(white, 0.5)
    const impactOuter = createGlowOrb(highlight, 1.1)
    const impactGroup = new THREE.Group()
    impactGroup.position.copy(gatePosition)
    impactGroup.add(impactInner, impactOuter)
    impactInner.scale.setScalar(0.05)
    impactOuter.scale.setScalar(0.05)
    scene.add(impactGroup)

    // --- reinforcement pillars + sprites (hidden until the light peaks) ---
    const spawned: {
        bakugan: bakuganOnSlot
        mesh: THREE.Sprite
        group: THREE.Group
        materials: THREE.Material[]
    }[] = []

    let sceneFx: ReturnType<typeof playSceneIlluminate> | null = null

    try {
        // 1 — the caster radiates
        await Promise.all([
            tween([casterInner.material, casterOuter.material], {
                opacity: 0.95,
                duration: 0.35,
                ease: "power2.out",
            }),
            tween([casterInner.scale, casterOuter.scale], {
                x: 1.4,
                y: 1.4,
                z: 1.4,
                duration: 0.45,
                ease: "power2.out",
            }),
            tween(spriteMaterial.color, {
                r: highlight.r,
                g: highlight.g,
                b: highlight.b,
                duration: 0.35,
                ease: "power1.out",
            }),
            tween(sourceMesh.scale, {
                x: sourceHomeScale.x * 1.25,
                y: sourceHomeScale.y * 1.25,
                duration: 0.45,
                ease: "power2.out",
            }),
        ])

        // 2 — the arrow takes off and crashes onto the gate card
        const flight = { t: 0 }
        const control = start
            .clone()
            .lerp(gatePosition, 0.5)
            .add(new THREE.Vector3(0, start.distanceTo(gatePosition) * 0.45 + 1.2, 0))
        const curve = new THREE.QuadraticBezierCurve3(start.clone(), control, gatePosition.clone())
        const up = new THREE.Vector3(0, 1, 0)

        const aimArrow = () => {
            const position = curve.getPoint(flight.t)
            const tangent = curve.getTangent(Math.min(flight.t + 0.001, 1)).normalize()
            arrow.position.copy(position)
            arrow.quaternion.setFromUnitVectors(up, tangent)
        }
        aimArrow()

        await Promise.all([
            tween(arrowMaterials, { opacity: 1, duration: 0.18, ease: "power2.out" }),
            tween(arrow.scale, { x: 1, y: 1, z: 1, duration: 0.2, ease: "back.out(2)" }),
        ])

        await tween(flight, {
            t: 1,
            duration: 0.75,
            ease: "power2.in",
            onUpdate: aimArrow,
        })

        await Promise.all([
            tween(arrowMaterials, { opacity: 0, duration: 0.18, ease: "power1.in" }),
            tween([impactInner.material, impactOuter.material], {
                opacity: 1,
                duration: 0.2,
                ease: "power2.out",
            }),
            tween([impactInner.scale, impactOuter.scale], {
                x: 2.6,
                y: 2.6,
                z: 2.6,
                duration: 0.35,
                ease: "power2.out",
            }),
        ])

        // 3 — the impact floods the whole board with light
        sceneFx = playSceneIlluminate({
            scene,
            tint: haos,
            lightMultiplier: 3,
            minBoostedIntensity: 2,
            backgroundLift: 0.7,
            riseDuration: 0.4,
            holdDuration: 0.85,
            fadeDuration: 0.6,
        })

        tween([impactInner.material, impactOuter.material], {
            opacity: 0,
            duration: 0.5,
            ease: "power1.in",
        })
        tween([impactInner.scale, impactOuter.scale], {
            x: 4.5,
            y: 4.5,
            z: 4.5,
            duration: 0.5,
            ease: "power1.out",
        })

        // 4 — allies make room, then the reinforcements appear inside the light
        const alliesToReposition = slot.bakugans.filter(
            (b) => b.userId === source.userId && !renforts.some((r) => r.id === b.id),
        )

        await Promise.all(
            alliesToReposition.map((ally) =>
                MoveBakugan({
                    bakugan: ally,
                    scene,
                    slot,
                    userId,
                    duration: 0.5,
                }),
            ),
        )

        for (const renfort of renforts) {
            const position = GetSpritePosition({
                bakugan: renfort,
                slot,
                slotIndex,
                userId,
            })
            if (!position) continue

            createSprite({
                bakugan: renfort,
                scene,
                slot,
                slotIndex,
                userId,
                bakugansMeshs,
            })

            const mesh = scene.getObjectByName(`${renfort.key}-${renfort.userId}`) as
                | THREE.Sprite
                | undefined
            if (!mesh) continue

            mesh.scale.set(0, 0, 1)
            mesh.position.set(position.x, BAKUGAN_REST_Y, position.z)

            const pillar = createLightPillar(highlight)
            const halo = createGlowOrb(white, 0.45)
            const group = new THREE.Group()
            group.position.set(position.x, 0.15, position.z)
            group.add(pillar, halo)
            pillar.scale.set(0.25, 0.3, 0.25)
            halo.scale.setScalar(0.1)
            scene.add(group)

            spawned.push({
                bakugan: renfort,
                mesh,
                group,
                materials: collectMaterials(group),
            })
        }

        await Promise.all(
            spawned.map(({ mesh, group, materials }, index) => {
                const pillar = group.children[0]
                const halo = group.children[1]
                return new Promise<void>((resolve) => {
                    gsap.delayedCall(index * 0.14, () => {
                        Promise.all([
                            tween(materials, {
                                opacity: 0.95,
                                duration: 0.25,
                                ease: "power2.out",
                            }),
                            tween(pillar.scale, {
                                x: 1,
                                y: 1,
                                z: 1,
                                duration: 0.3,
                                ease: "power2.out",
                            }),
                            tween(halo.scale, {
                                x: 1.5,
                                y: 1.5,
                                z: 1.5,
                                duration: 0.35,
                                ease: "power2.out",
                            }),
                            tween(mesh.scale, {
                                x: BAKUGAN_REST_SCALE,
                                y: BAKUGAN_REST_SCALE,
                                duration: 0.5,
                                delay: 0.15,
                                ease: "back.out(1.6)",
                            }),
                        ]).then(() => resolve())
                    })
                })
            }),
        )

        await Promise.all([
            sceneFx.done,
            ...spawned.map(({ group, materials }) =>
                Promise.all([
                    tween(materials, { opacity: 0, duration: 0.4, ease: "power1.in" }),
                    tween(group.children[0].scale, {
                        x: 0.15,
                        y: 1.3,
                        z: 0.15,
                        duration: 0.4,
                        ease: "power1.in",
                    }),
                ]),
            ),
        ])

        // caster returns to rest
        await Promise.all([
            tween([casterInner.material, casterOuter.material], {
                opacity: 0,
                duration: 0.35,
                ease: "power1.in",
            }),
            tween(spriteMaterial.color, {
                r: originalSpriteColor.r,
                g: originalSpriteColor.g,
                b: originalSpriteColor.b,
                duration: 0.35,
                ease: "power1.inOut",
            }),
            tween(sourceMesh.scale, {
                x: sourceHomeScale.x,
                y: sourceHomeScale.y,
                duration: 0.35,
                ease: "power2.inOut",
            }),
        ])
    } finally {
        sceneFx?.dispose()

        gsap.killTweensOf(spriteMaterial.color)
        gsap.killTweensOf(sourceMesh.scale)
        gsap.killTweensOf(casterInner.scale)
        gsap.killTweensOf(casterOuter.scale)
        gsap.killTweensOf(casterInner.material)
        gsap.killTweensOf(casterOuter.material)
        gsap.killTweensOf(arrow.scale)
        arrowMaterials.forEach((material) => gsap.killTweensOf(material))
        gsap.killTweensOf(impactInner.scale)
        gsap.killTweensOf(impactOuter.scale)
        gsap.killTweensOf(impactInner.material)
        gsap.killTweensOf(impactOuter.material)

        spriteMaterial.color.copy(originalSpriteColor)
        sourceMesh.scale.copy(sourceHomeScale)

        spawned.forEach(({ mesh, group, materials }) => {
            gsap.killTweensOf(mesh.scale)
            materials.forEach((material) => gsap.killTweensOf(material))
            group.children.forEach((child) => gsap.killTweensOf(child.scale))
            mesh.scale.set(BAKUGAN_REST_SCALE, BAKUGAN_REST_SCALE, 1)
            scene.remove(group)
            disposeObject(group)
        })

        scene.remove(casterGroup)
        scene.remove(arrow)
        scene.remove(impactGroup)
        disposeObject(casterGroup)
        disposeObject(arrow)
        disposeObject(impactGroup)
    }
}
