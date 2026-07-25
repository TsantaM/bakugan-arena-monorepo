import type { bakuganOnSlot } from "@bakugan-arena/game-data"
import gsap from "gsap"
import * as THREE from "three"
import { getAttributColor } from "../../functions/get-attrubut-color"
import type { CustomAnimationContext } from "./types"

const CARD_WIDTH = 0.85
const CARD_HEIGHT = 1.25
const HAOS_CARD_TEXTURE = "./../images/cards/ability_card_HAOS.jpg"
const DEFAULT_CARD_COUNT = 3

function createGlowOrb(
    color: THREE.Color,
    size: number,
): THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial> {
    const geometry = new THREE.SphereGeometry(size, 16, 16)
    const material = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
    })
    return new THREE.Mesh(geometry, material)
}

function createAbilityCardMesh(): THREE.Mesh<THREE.PlaneGeometry, THREE.MeshStandardMaterial> {
    const geometry = new THREE.PlaneGeometry(CARD_WIDTH, CARD_HEIGHT)
    const texture = new THREE.TextureLoader().load(HAOS_CARD_TEXTURE)
    const material = new THREE.MeshStandardMaterial({
        map: texture,
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
        emissive: new THREE.Color(getAttributColor("Haos")),
        emissiveIntensity: 0.6,
        depthWrite: false,
    })
    return new THREE.Mesh(geometry, material)
}

function disposeObject(object: THREE.Object3D) {
    object.traverse((child) => {
        if (!(child instanceof THREE.Mesh) && !(child instanceof THREE.Sprite)) return

        const material = child.material as THREE.Material | THREE.Material[]
        const materials = Array.isArray(material) ? material : [material]
        for (const mat of materials) {
            if (mat instanceof THREE.MeshStandardMaterial) {
                mat.map?.dispose()
            }
            if (mat instanceof THREE.SpriteMaterial) {
                mat.map?.dispose()
            }
            mat.dispose()
        }

        if (child instanceof THREE.Mesh) {
            child.geometry.dispose()
        }
    })
}

function tween(targets: gsap.TweenTarget, vars: gsap.TweenVars): Promise<void> {
    return new Promise((resolve) => {
        gsap.to(targets, {
            ...vars,
            onComplete: resolve,
        })
    })
}

function resolveOwnerUserId(
    payload: Record<string, unknown>,
    sourceBakugan?: bakuganOnSlot,
): string | null {
    if (typeof payload.ownerUserId === "string") return payload.ownerUserId
    return sourceBakugan?.userId ?? null
}

function resolveCardCount(payload: Record<string, unknown>): number {
    if (typeof payload.cardCount === "number" && payload.cardCount > 0) {
        return Math.min(Math.floor(payload.cardCount), 6)
    }
    return DEFAULT_CARD_COUNT
}

function getPlayerReturnPosition(
    camera: THREE.PerspectiveCamera,
    ownerUserId: string,
    viewerUserId: string,
): THREE.Vector3 {
    const isOwnerViewer = ownerUserId === viewerUserId
    return new THREE.Vector3(
        isOwnerViewer ? camera.position.x : -camera.position.x,
        Math.max(camera.position.y * 0.55, 1.2),
        isOwnerViewer ? camera.position.z : -camera.position.z,
    )
}

/**
 * Haos Immobilisation —
 * 1) All Haos bakugans on the board pulse with Haos light
 * 2) Recovered ability cards appear and fly back to their owner
 */
export async function HaosImmobilisationAnimation({
    scene,
    camera,
    userId,
    data,
}: CustomAnimationContext): Promise<void> {
    const payload = data.payload ?? {}
    const haosBakugans = data.targetBakugans?.length
        ? data.targetBakugans
        : data.sourceBakugan
          ? [data.sourceBakugan]
          : []
    if (haosBakugans.length === 0) return

    const ownerUserId = resolveOwnerUserId(payload, data.sourceBakugan)
    if (!ownerUserId) return

    const haos = new THREE.Color(getAttributColor("Haos"))
    const highlight = haos.clone().lerp(new THREE.Color(0xffffff), 0.45)

    const shineTargets: Array<{
        mesh: THREE.Sprite
        material: THREE.SpriteMaterial
        originalColor: THREE.Color
        homeScale: THREE.Vector3
        glowInner: THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial>
        glowOuter: THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial>
    }> = []

    for (const bakugan of haosBakugans) {
        const mesh = scene.getObjectByName(
            `${bakugan.key}-${bakugan.userId}`,
        ) as THREE.Sprite | undefined
        if (!mesh) continue

        const material = mesh.material as THREE.SpriteMaterial
        const glowInner = createGlowOrb(highlight, 0.35)
        const glowOuter = createGlowOrb(haos, 0.65)
        glowInner.position.copy(mesh.position)
        glowOuter.position.copy(mesh.position)
        glowInner.scale.setScalar(0.2)
        glowOuter.scale.setScalar(0.2)
        scene.add(glowInner, glowOuter)

        shineTargets.push({
            mesh,
            material,
            originalColor: material.color.clone(),
            homeScale: mesh.scale.clone(),
            glowInner,
            glowOuter,
        })
    }

    if (shineTargets.length === 0) return

    const disposable: THREE.Object3D[] = shineTargets.flatMap((t) => [
        t.glowInner,
        t.glowOuter,
    ])

    try {
        // 1 — Haos bakugans shine
        await Promise.all(
            shineTargets.map(({ mesh, material, homeScale, glowInner, glowOuter }) =>
                Promise.all([
                    tween(material.color, {
                        r: haos.r,
                        g: haos.g,
                        b: haos.b,
                        duration: 0.35,
                        ease: "power2.out",
                    }),
                    tween(mesh.scale, {
                        x: homeScale.x * 1.2,
                        y: homeScale.y * 1.2,
                        duration: 0.4,
                        yoyo: true,
                        repeat: 2,
                        ease: "sine.inOut",
                    }),
                    tween([glowInner.material, glowOuter.material], {
                        opacity: 0.95,
                        duration: 0.3,
                        ease: "power1.out",
                    }),
                    tween([glowInner.scale, glowOuter.scale], {
                        x: 1.15,
                        y: 1.15,
                        z: 1.15,
                        duration: 0.5,
                        yoyo: true,
                        repeat: 2,
                        ease: "sine.inOut",
                    }),
                ]),
            ),
        )

        await Promise.all(
            shineTargets.map(({ material, originalColor, glowInner, glowOuter }) =>
                Promise.all([
                    tween(material.color, {
                        r: originalColor.r,
                        g: originalColor.g,
                        b: originalColor.b,
                        duration: 0.25,
                        ease: "power1.inOut",
                    }),
                    tween([glowInner.material, glowOuter.material], {
                        opacity: 0,
                        duration: 0.25,
                        ease: "power1.in",
                    }),
                ]),
            ),
        )

        // 2 — Ability cards appear and return to the owner
        const cardCount = resolveCardCount(payload)
        const returnPos = getPlayerReturnPosition(camera, ownerUserId, userId)
        const spawnCenter =
            data.sourceBakugan &&
            scene.getObjectByName(
                `${data.sourceBakugan.key}-${data.sourceBakugan.userId}`,
            )?.position.clone() ||
            shineTargets[0].mesh.position.clone()

        const cards = Array.from({ length: cardCount }, (_, index) => {
            const card = createAbilityCardMesh()
            const spread = (index - (cardCount - 1) / 2) * 0.55
            card.position.set(
                spawnCenter.x + spread,
                spawnCenter.y + 0.4,
                spawnCenter.z,
            )
            card.scale.setScalar(0.15)
            card.lookAt(camera.position)
            scene.add(card)
            disposable.push(card)
            return { card, spread, index }
        })

        await Promise.all(
            cards.map(({ card, index }) =>
                Promise.all([
                    tween(card.material, {
                        opacity: 1,
                        duration: 0.25,
                        delay: index * 0.08,
                        ease: "power1.out",
                    }),
                    tween(card.scale, {
                        x: 1,
                        y: 1,
                        z: 1,
                        duration: 0.35,
                        delay: index * 0.08,
                        ease: "back.out(1.7)",
                    }),
                    tween(card.position, {
                        y: spawnCenter.y + 1.1,
                        duration: 0.35,
                        delay: index * 0.08,
                        ease: "power2.out",
                    }),
                ]),
            ),
        )

        await Promise.all(
            cards.map(({ card, spread, index }) => {
                card.lookAt(returnPos)
                return Promise.all([
                    tween(card.position, {
                        x: returnPos.x + spread * 0.15,
                        y: returnPos.y,
                        z: returnPos.z,
                        duration: 0.7,
                        delay: index * 0.1,
                        ease: "power2.in",
                        onUpdate: () => {
                            card.lookAt(returnPos)
                        },
                    }),
                    tween(card.scale, {
                        x: 0.25,
                        y: 0.25,
                        z: 0.25,
                        duration: 0.7,
                        delay: index * 0.1,
                        ease: "power2.in",
                    }),
                    tween(card.material, {
                        opacity: 0,
                        duration: 0.25,
                        delay: 0.45 + index * 0.1,
                        ease: "power1.in",
                    }),
                ])
            }),
        )
    } finally {
        for (const target of shineTargets) {
            gsap.killTweensOf(target.material.color)
            gsap.killTweensOf(target.mesh.scale)
            gsap.killTweensOf(target.glowInner.scale)
            gsap.killTweensOf(target.glowOuter.scale)
            gsap.killTweensOf(target.glowInner.material)
            gsap.killTweensOf(target.glowOuter.material)

            target.material.color.copy(target.originalColor)
            target.mesh.scale.copy(target.homeScale)
        }

        for (const object of disposable) {
            gsap.killTweensOf(object)
            gsap.killTweensOf(object.position)
            gsap.killTweensOf(object.scale)
            if (object instanceof THREE.Mesh) {
                gsap.killTweensOf(object.material)
            }
            scene.remove(object)
            disposeObject(object)
        }
    }
}
