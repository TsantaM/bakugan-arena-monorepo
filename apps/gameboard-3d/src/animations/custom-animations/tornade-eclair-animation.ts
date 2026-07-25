import gsap from "gsap"
import * as THREE from "three"
import { getAttributColor } from "../../functions/get-attrubut-color"
import { playGrayTrembleHitReaction } from "../effects"
import type { CustomAnimationContext } from "./types"

const BOLT_COUNT = 3
const SKY_HEIGHT = 7.5

function disposeObject(object: THREE.Object3D) {
    object.traverse((child) => {
        if (child instanceof THREE.Line || child instanceof THREE.Mesh) {
            child.geometry.dispose()
            const material = child.material as THREE.Material | THREE.Material[]
            if (Array.isArray(material)) {
                material.forEach((m) => m.dispose())
            } else {
                material.dispose()
            }
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

function buildLightningPoints(
    start: THREE.Vector3,
    end: THREE.Vector3,
    segments = 10,
): THREE.Vector3[] {
    const points: THREE.Vector3[] = []
    const direction = end.clone().sub(start)
    const length = direction.length()
    const dir = direction.clone().normalize()

    // Perpendicular axes for jagged offsets
    const up = Math.abs(dir.y) > 0.9 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0)
    const side = new THREE.Vector3().crossVectors(dir, up).normalize()
    const bitangent = new THREE.Vector3().crossVectors(dir, side).normalize()

    for (let i = 0; i <= segments; i++) {
        const t = i / segments
        const point = start.clone().lerp(end, t)
        if (i > 0 && i < segments) {
            const jagged = (1 - Math.abs(t - 0.5) * 2) * 0.45
            point.addScaledVector(side, (Math.random() - 0.5) * jagged * length * 0.12)
            point.addScaledVector(bitangent, (Math.random() - 0.5) * jagged * length * 0.08)
        }
        points.push(point)
    }

    return points
}

function createLightningBolt(
    start: THREE.Vector3,
    end: THREE.Vector3,
    color: THREE.Color,
    widthBoost = 1,
): THREE.Group {
    const group = new THREE.Group()
    const points = buildLightningPoints(start, end, 12 + Math.floor(Math.random() * 4))

    const coreGeo = new THREE.BufferGeometry().setFromPoints(points)
    const core = new THREE.Line(
        coreGeo,
        new THREE.LineBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0,
            depthWrite: false,
        }),
    )

    const glowGeo = new THREE.BufferGeometry().setFromPoints(points)
    const glow = new THREE.Line(
        glowGeo,
        new THREE.LineBasicMaterial({
            color,
            transparent: true,
            opacity: 0,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
        }),
    )
    glow.scale.setScalar(1 + 0.04 * widthBoost)

    group.add(glow, core)
    return group
}

function createImpactFlash(color: THREE.Color): THREE.Mesh {
    const geometry = new THREE.SphereGeometry(0.35, 16, 16)
    const material = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
    })
    return new THREE.Mesh(geometry, material)
}

/**
 * Tornade Éclair — jagged Haos lightning bolts strike the opposing bakugan.
 */
export async function TornadeEclairAnimation({
    scene,
    data,
}: CustomAnimationContext): Promise<void> {
    const target = data.targetBakugans?.[0]
    if (!target) return

    const targetMesh = scene.getObjectByName(
        `${target.key}-${target.userId}`,
    ) as THREE.Sprite | undefined
    if (!targetMesh) return

    const haos = new THREE.Color(getAttributColor("Haos"))
    const highlight = haos.clone().lerp(new THREE.Color(0xffffff), 0.55)
    const impactPos = targetMesh.position.clone()
    impactPos.y += 0.25

    const disposable: THREE.Object3D[] = []
    const bolts: THREE.Group[] = []

    for (let i = 0; i < BOLT_COUNT; i++) {
        const spreadX = (Math.random() - 0.5) * 1.4
        const spreadZ = (Math.random() - 0.5) * 1.4
        const start = new THREE.Vector3(
            impactPos.x + spreadX,
            SKY_HEIGHT + Math.random() * 1.5,
            impactPos.z + spreadZ,
        )
        const end = impactPos.clone().add(
            new THREE.Vector3(
                (Math.random() - 0.5) * 0.15,
                0,
                (Math.random() - 0.5) * 0.15,
            ),
        )
        const bolt = createLightningBolt(start, end, highlight, 1 + i * 0.15)
        scene.add(bolt)
        bolts.push(bolt)
        disposable.push(bolt)
    }

    const flash = createImpactFlash(highlight)
    flash.position.copy(impactPos)
    flash.scale.setScalar(0.2)
    scene.add(flash)
    disposable.push(flash)

    try {
        // Staggered bolt flashes
        for (let i = 0; i < bolts.length; i++) {
            const bolt = bolts[i]
            const materials = bolt.children.map(
                (child) => (child as THREE.Line).material as THREE.LineBasicMaterial,
            )

            await Promise.all([
                tween(materials, {
                    opacity: i === 0 ? 1 : 0.85,
                    duration: 0.06,
                    ease: "power1.out",
                }),
                tween(flash.material, {
                    opacity: 0.9,
                    duration: 0.06,
                    ease: "power1.out",
                }),
                tween(flash.scale, {
                    x: 1.4 + i * 0.25,
                    y: 1.4 + i * 0.25,
                    z: 1.4 + i * 0.25,
                    duration: 0.12,
                    ease: "power2.out",
                }),
            ])

            await tween(materials, {
                opacity: 0,
                duration: 0.08,
                ease: "power1.in",
                delay: 0.04,
            })
        }

        // Final sustained strike + hit reaction
        const mainBolt = bolts[0]
        const mainMats = mainBolt.children.map(
            (child) => (child as THREE.Line).material as THREE.LineBasicMaterial,
        )

        await Promise.all([
            tween(mainMats, {
                opacity: 1,
                duration: 0.05,
                ease: "power1.out",
            }),
            tween(flash.material, {
                opacity: 1,
                duration: 0.05,
            }),
            tween(flash.scale, {
                x: 2.2,
                y: 2.2,
                z: 2.2,
                duration: 0.2,
                ease: "power2.out",
            }),
            playGrayTrembleHitReaction({
                target: targetMesh,
                grayColor: highlight,
                shakeAmount: { x: 0.1, z: 0.08 },
            }),
        ])

        await Promise.all([
            tween(mainMats, {
                opacity: 0,
                duration: 0.25,
                ease: "power1.in",
            }),
            tween(flash.material, {
                opacity: 0,
                duration: 0.3,
                ease: "power1.in",
            }),
            tween(flash.scale, {
                x: 0.3,
                y: 0.3,
                z: 0.3,
                duration: 0.3,
                ease: "power1.in",
            }),
        ])
    } finally {
        for (const object of disposable) {
            gsap.killTweensOf(object)
            gsap.killTweensOf(object.scale)
            object.traverse((child) => {
                if (child instanceof THREE.Line || child instanceof THREE.Mesh) {
                    gsap.killTweensOf(child.material)
                }
            })
            scene.remove(object)
            disposeObject(object)
        }
    }
}
