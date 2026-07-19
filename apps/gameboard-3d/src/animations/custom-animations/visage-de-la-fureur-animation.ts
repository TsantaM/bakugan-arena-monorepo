import * as THREE from "three"
import gsap from "gsap"
import type { CustomAnimationContext } from "./types"
import { getAttributColor } from "../../functions/get-attrubut-color"

function createFlameOrb(color: THREE.Color, size = 0.18): THREE.Mesh {
    const geometry = new THREE.SphereGeometry(size, 12, 12)
    const material = new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 4,
        transparent: true,
        opacity: 0.95,
        roughness: 0.3,
        metalness: 0.1,
    })
    return new THREE.Mesh(geometry, material)
}

function createFlameTrail(color: THREE.Color): THREE.Mesh {
    const geometry = new THREE.SphereGeometry(0.08, 8, 8)
    const material = new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 2.5,
        transparent: true,
        opacity: 0.7,
    })
    return new THREE.Mesh(geometry, material)
}

export async function VisageDeLaFureurAnimation({
    scene,
    data,
}: CustomAnimationContext): Promise<void> {
    const { sourceBakugan, targetBakugans } = data
    if (!sourceBakugan || !targetBakugans?.length) return

    const sourceMesh = scene.getObjectByName(`${sourceBakugan.key}-${sourceBakugan.userId}`)
    if (!sourceMesh) return

    const sourcePos = sourceMesh.getWorldPosition(new THREE.Vector3())
    const flameColor = new THREE.Color(getAttributColor("Pyrus"))
    const coreColor = new THREE.Color(getAttributColor("Pyrus"))

    // Burst around the caster
    const burst = createFlameOrb(coreColor, 0.35)
    burst.position.copy(sourcePos)
    burst.position.y += 0.3
    scene.add(burst)

    await new Promise<void>((resolve) => {
        gsap.to(burst.scale, {
            x: 2.2,
            y: 2.2,
            z: 2.2,
            duration: 0.25,
            ease: "power2.out",
            onComplete: () => {
                gsap.to(burst.material, {
                    opacity: 0,
                    duration: 0.2,
                    onComplete: () => {
                        scene.remove(burst)
                        burst.geometry.dispose()
                        ;(burst.material as THREE.MeshStandardMaterial).dispose()
                        resolve()
                    },
                })
            },
        })
    })

    await Promise.all(
        targetBakugans.map(async (target, index) => {
            const targetMesh = scene.getObjectByName(`${target.key}-${target.userId}`)
            if (!targetMesh) return

            const targetPos = targetMesh.getWorldPosition(new THREE.Vector3())
            targetPos.y += 0.25

            const flame = createFlameOrb(flameColor, 0.2)
            flame.position.copy(sourcePos)
            flame.position.y += 0.35
            scene.add(flame)

            const trail = createFlameTrail(coreColor)
            trail.position.copy(flame.position)
            scene.add(trail)

            const delay = index * 0.08

            await Promise.all([
                new Promise<void>((resolve) => {
                    gsap.to(flame.position, {
                        x: targetPos.x,
                        y: targetPos.y,
                        z: targetPos.z,
                        duration: 0.55,
                        delay,
                        ease: "power2.in",
                        onUpdate: () => {
                            trail.position.lerp(flame.position, 0.35)
                        },
                        onComplete: () => {
                            // Impact flash on target
                            gsap.to(flame.scale, {
                                x: 1.8,
                                y: 1.8,
                                z: 1.8,
                                duration: 0.15,
                                yoyo: true,
                                repeat: 1,
                                onComplete: () => {
                                    scene.remove(flame)
                                    scene.remove(trail)
                                    flame.geometry.dispose()
                                    trail.geometry.dispose()
                                    ;(flame.material as THREE.MeshStandardMaterial).dispose()
                                    ;(trail.material as THREE.MeshStandardMaterial).dispose()
                                    resolve()
                                },
                            })
                        },
                    })
                }),
                new Promise<void>((resolve) => {
                    gsap.to(trail.material, {
                        opacity: 0,
                        duration: 0.55,
                        delay,
                        ease: "power1.in",
                        onComplete: () => resolve(),
                    })
                }),
            ])
        })
    )
}
