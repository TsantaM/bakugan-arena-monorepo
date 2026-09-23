import gsap from "gsap"
import * as THREE from "three"
import { getAttributColor } from "../../functions/get-attrubut-color"
import type { CustomAnimationContext } from "./types"

const COLUMN_COUNT = 6
const COLUMN_RADIUS = 0.85
const COLUMN_HEIGHT = 2.6
const GROUND_Y = 0.08

function createWaterColumn(color: THREE.Color): THREE.Mesh<THREE.CylinderGeometry, THREE.MeshBasicMaterial> {
    const geometry = new THREE.CylinderGeometry(0.16, 0.26, COLUMN_HEIGHT, 14, 1, true)
    const material = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
    })
    const column = new THREE.Mesh(geometry, material)
    column.position.y = COLUMN_HEIGHT / 2
    return column
}

/** Ripple ring laid flat on the board (plane-local space). */
function createRippleRing(color: THREE.Color): THREE.Mesh<THREE.RingGeometry, THREE.MeshBasicMaterial> {
    const geometry = new THREE.RingGeometry(0.5, 0.68, 48)
    const material = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
    })
    const ring = new THREE.Mesh(geometry, material)
    ring.scale.setScalar(0.3)
    ring.position.z = 0.05
    return ring
}

function createDroplet(color: THREE.Color, size: number): THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial> {
    const geometry = new THREE.SphereGeometry(size, 10, 10)
    const material = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
    })
    return new THREE.Mesh(geometry, material)
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

function tween(targets: gsap.TweenTarget, vars: gsap.TweenVars): Promise<void> {
    return new Promise((resolve) => {
        gsap.to(targets, {
            ...vars,
            onComplete: resolve,
        })
    })
}

/**
 * Aquos Cyclone — swirling water columns rise around each target and close in
 * on them, just before POWER_CHANGE drains their power.
 */
export async function AquosCycloneAnimation({
    scene,
    plane,
    data,
}: CustomAnimationContext): Promise<void> {
    const targets = data.targetBakugans ?? []
    if (targets.length === 0) return

    const aquos = new THREE.Color(getAttributColor("Aquos"))
    const white = new THREE.Color(0xffffff)
    const foam = aquos.clone().lerp(white, 0.55)
    const deep = aquos.clone().lerp(new THREE.Color(0x0c4a6e), 0.4)

    const cyclones: {
        group: THREE.Group
        columns: THREE.Mesh<THREE.CylinderGeometry, THREE.MeshBasicMaterial>[]
        droplets: THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial>[]
        targetMesh: THREE.Sprite
        originalColor: THREE.Color
        homePosition: THREE.Vector3
        ripple: THREE.Mesh<THREE.RingGeometry, THREE.MeshBasicMaterial>
    }[] = []

    for (const target of targets) {
        const targetMesh = scene.getObjectByName(
            `${target.key}-${target.userId}`,
        ) as THREE.Sprite | undefined
        if (!targetMesh) continue

        const group = new THREE.Group()
        group.position.set(targetMesh.position.x, GROUND_Y, targetMesh.position.z)
        scene.add(group)

        const columns: THREE.Mesh<THREE.CylinderGeometry, THREE.MeshBasicMaterial>[] = []
        const droplets: THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial>[] = []

        for (let i = 0; i < COLUMN_COUNT; i++) {
            const angle = (i / COLUMN_COUNT) * Math.PI * 2
            const column = createWaterColumn(i % 2 === 0 ? foam : deep)
            column.position.x = Math.cos(angle) * COLUMN_RADIUS
            column.position.z = Math.sin(angle) * COLUMN_RADIUS
            column.scale.set(0.6, 0, 0.6)
            group.add(column)
            columns.push(column)

            const droplet = createDroplet(foam, 0.07 + Math.random() * 0.05)
            droplet.position.set(
                Math.cos(angle + 0.4) * (COLUMN_RADIUS + 0.15),
                0.4 + Math.random() * 1.4,
                Math.sin(angle + 0.4) * (COLUMN_RADIUS + 0.15),
            )
            group.add(droplet)
            droplets.push(droplet)
        }

        const ripple = createRippleRing(foam)
        const rippleLocal = plane.worldToLocal(
            new THREE.Vector3(targetMesh.position.x, GROUND_Y, targetMesh.position.z),
        )
        ripple.position.x = rippleLocal.x
        ripple.position.y = rippleLocal.y
        plane.add(ripple)

        cyclones.push({
            group,
            columns,
            droplets,
            targetMesh,
            ripple,
            originalColor: (targetMesh.material as THREE.SpriteMaterial).color.clone(),
            homePosition: targetMesh.position.clone(),
        })
    }

    if (cyclones.length === 0) return

    try {
        // 1 — the water surges up from the board around each target
        await Promise.all(
            cyclones.flatMap(({ columns, droplets, ripple }, cycloneIndex) => {
                return [
                    tween(ripple.material, {
                        opacity: 0.8,
                        duration: 0.25,
                        delay: cycloneIndex * 0.12,
                        ease: "power1.out",
                    }),
                    tween(ripple.scale, {
                        x: 2.6,
                        y: 2.6,
                        z: 1,
                        duration: 0.7,
                        delay: cycloneIndex * 0.12,
                        ease: "power2.out",
                    }),
                    ...columns.map((column, index) =>
                        tween(column.scale, {
                            x: 1,
                            y: 1,
                            z: 1,
                            duration: 0.5,
                            delay: cycloneIndex * 0.12 + index * 0.05,
                            ease: "power2.out",
                        }),
                    ),
                    ...columns.map((column, index) =>
                        tween(column.material, {
                            opacity: 0.85,
                            duration: 0.35,
                            delay: cycloneIndex * 0.12 + index * 0.05,
                            ease: "power1.out",
                        }),
                    ),
                    ...droplets.map((droplet, index) =>
                        tween(droplet.material, {
                            opacity: 0.9,
                            duration: 0.3,
                            delay: cycloneIndex * 0.12 + index * 0.04,
                            ease: "power1.out",
                        }),
                    ),
                ]
            }),
        )

        // 2 — the columns spin around the targets and tighten the cyclone
        await Promise.all(
            cyclones.flatMap(({ group, columns, droplets, targetMesh }) => {
                const spriteMaterial = targetMesh.material as THREE.SpriteMaterial
                return [
                    tween(group.rotation, {
                        y: Math.PI * 2.5,
                        duration: 1.1,
                        ease: "power1.inOut",
                    }),
                    ...columns.map((column) =>
                        tween(column.position, {
                            x: column.position.x * 0.55,
                            z: column.position.z * 0.55,
                            duration: 1.1,
                            ease: "power2.in",
                        }),
                    ),
                    ...columns.map((column) =>
                        tween(column.scale, {
                            x: 1.35,
                            y: 1.25,
                            z: 1.35,
                            duration: 1.1,
                            ease: "power1.inOut",
                        }),
                    ),
                    ...droplets.map((droplet) =>
                        tween(droplet.position, {
                            y: droplet.position.y + 1.2 + Math.random() * 0.6,
                            duration: 1.1,
                            ease: "sine.inOut",
                        }),
                    ),
                    tween(spriteMaterial.color, {
                        r: deep.r,
                        g: deep.g,
                        b: deep.b,
                        duration: 0.8,
                        ease: "power1.inOut",
                    }),
                    tween(targetMesh.position, {
                        x: targetMesh.position.x + 0.06,
                        duration: 0.09,
                        repeat: 9,
                        yoyo: true,
                        ease: "sine.inOut",
                    }),
                ]
            }),
        )

        // 3 — the water collapses right before the power drain
        await Promise.all(
            cyclones.flatMap(({ columns, droplets, ripple, targetMesh, originalColor }) => {
                const spriteMaterial = targetMesh.material as THREE.SpriteMaterial
                return [
                    tween(ripple.material, {
                        opacity: 0,
                        duration: 0.35,
                        ease: "power1.in",
                    }),
                    ...columns.map((column) =>
                        tween(column.material, {
                            opacity: 0,
                            duration: 0.4,
                            ease: "power1.in",
                        }),
                    ),
                    ...columns.map((column) =>
                        tween(column.scale, {
                            x: 0.4,
                            y: 1.6,
                            z: 0.4,
                            duration: 0.4,
                            ease: "power1.in",
                        }),
                    ),
                    ...droplets.map((droplet) =>
                        tween(droplet.material, {
                            opacity: 0,
                            duration: 0.35,
                            ease: "power1.in",
                        }),
                    ),
                    tween(spriteMaterial.color, {
                        r: originalColor.r,
                        g: originalColor.g,
                        b: originalColor.b,
                        duration: 0.4,
                        ease: "power1.inOut",
                    }),
                ]
            }),
        )
    } finally {
        cyclones.forEach(({ group, columns, droplets, ripple, targetMesh, originalColor, homePosition }) => {
            const spriteMaterial = targetMesh.material as THREE.SpriteMaterial
            gsap.killTweensOf(group.rotation)
            gsap.killTweensOf(targetMesh.position)
            gsap.killTweensOf(spriteMaterial.color)
            columns.forEach((column) => {
                gsap.killTweensOf(column.scale)
                gsap.killTweensOf(column.position)
                gsap.killTweensOf(column.material)
            })
            droplets.forEach((droplet) => {
                gsap.killTweensOf(droplet.position)
                gsap.killTweensOf(droplet.material)
            })

            gsap.killTweensOf(ripple.scale)
            gsap.killTweensOf(ripple.material)

            spriteMaterial.color.copy(originalColor)
            targetMesh.position.copy(homePosition)

            scene.remove(group)
            disposeObject(group)
            plane.remove(ripple)
            ripple.geometry.dispose()
            ripple.material.dispose()
        })
    }
}
