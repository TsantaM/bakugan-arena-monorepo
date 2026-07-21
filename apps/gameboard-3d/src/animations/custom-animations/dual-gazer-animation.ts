import * as THREE from "three"
import gsap from "gsap"
import type { CustomAnimationContext } from "./types"
import { getAttributColor } from "../../functions/get-attrubut-color"
import { playGrayTrembleHitReaction } from "../effects"

/**
 * Optional 2D projectile texture.
 * Set to a path (e.g. `./../images/effects/dual-gazer-orb.png`) to replace
 * the procedural energy sphere with a Sprite using that image.
 */
const PROJECTILE_IMAGE_URL: string | null = "./../images/effects-sprites/darkus-projectile.png"

const BURST_COUNT = 5
const BURST_STAGGER = 0.07
const PROJECTILE_SIZE = 0.16

function createProjectile(color: THREE.Color, size = PROJECTILE_SIZE): THREE.Object3D {
    if (PROJECTILE_IMAGE_URL) {
        const texture = new THREE.TextureLoader().load(PROJECTILE_IMAGE_URL)
        const sprite = new THREE.Sprite(
            new THREE.SpriteMaterial({
                map: texture,
                transparent: true,
                color,
                depthWrite: false,
            })
        )
        sprite.scale.set(size * 2.4, size * 2.4, 1)
        return sprite
    }

    const geometry = new THREE.SphereGeometry(size, 12, 12)
    const material = new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 3.5,
        transparent: true,
        opacity: 0.95,
        roughness: 0.25,
        metalness: 0.15,
    })
    return new THREE.Mesh(geometry, material)
}

function disposeProjectile(projectile: THREE.Object3D) {
    if (projectile instanceof THREE.Sprite) {
        const mat = projectile.material as THREE.SpriteMaterial
        mat.map?.dispose()
        mat.dispose()
        return
    }

    if (projectile instanceof THREE.Mesh) {
        projectile.geometry.dispose()
        ;(projectile.material as THREE.MeshStandardMaterial).dispose()
    }
}

function getProjectileOpacityTarget(projectile: THREE.Object3D): { opacity: number } | null {
    if (projectile instanceof THREE.Sprite) {
        return projectile.material as THREE.SpriteMaterial
    }
    if (projectile instanceof THREE.Mesh) {
        return projectile.material as THREE.MeshStandardMaterial
    }
    return null
}

async function fireBurstToward(
    scene: THREE.Scene,
    sourcePos: THREE.Vector3,
    targetMesh: THREE.Object3D,
    color: THREE.Color,
): Promise<void> {
    const targetPos = targetMesh.getWorldPosition(new THREE.Vector3())
    targetPos.y += 0.25

    const shots = Array.from({ length: BURST_COUNT }, (_, index) => {
        const projectile = createProjectile(color)
        const spread = (index - (BURST_COUNT - 1) / 2) * 0.08
        projectile.position.set(
            sourcePos.x + spread,
            sourcePos.y + 0.35 + Math.abs(spread) * 0.15,
            sourcePos.z + spread * 0.4,
        )
        scene.add(projectile)

        const delay = index * BURST_STAGGER
        const isLast = index === BURST_COUNT - 1

        return new Promise<void>((resolve) => {
            gsap.to(projectile.position, {
                x: targetPos.x + spread * 0.3,
                y: targetPos.y,
                z: targetPos.z + spread * 0.2,
                duration: 0.42,
                delay,
                ease: "power2.in",
                onComplete: () => {
                    gsap.to(projectile.scale, {
                        x: projectile.scale.x * 1.6,
                        y: projectile.scale.y * 1.6,
                        z: projectile.scale.z * 1.6,
                        duration: 0.1,
                        yoyo: true,
                        repeat: 1,
                        onComplete: () => {
                            const finish = () => {
                                scene.remove(projectile)
                                disposeProjectile(projectile)
                                if (isLast) {
                                    playGrayTrembleHitReaction({ target: targetMesh }).then(resolve)
                                } else {
                                    resolve()
                                }
                            }

                            const opacityTarget = getProjectileOpacityTarget(projectile)
                            if (opacityTarget) {
                                gsap.to(opacityTarget, {
                                    opacity: 0,
                                    duration: 0.12,
                                    onComplete: finish,
                                })
                            } else {
                                finish()
                            }
                        },
                    })
                },
            })
        })
    })

    await Promise.all(shots)
}

export async function DualGazerAnimation({
    scene,
    data,
}: CustomAnimationContext): Promise<void> {
    const { sourceBakugan, targetBakugans } = data
    if (!sourceBakugan || !targetBakugans?.length) return

    const sourceMesh = scene.getObjectByName(`${sourceBakugan.key}-${sourceBakugan.userId}`)
    if (!sourceMesh) return

    const sourcePos = sourceMesh.getWorldPosition(new THREE.Vector3())
    const energyColor = new THREE.Color(getAttributColor("Darkus"))

    const charge = createProjectile(energyColor, 0.28)
    charge.position.copy(sourcePos)
    charge.position.y += 0.3
    scene.add(charge)

    await new Promise<void>((resolve) => {
        gsap.to(charge.scale, {
            x: 2,
            y: 2,
            z: 2,
            duration: 0.22,
            ease: "power2.out",
            onComplete: () => {
                const opacityTarget = getProjectileOpacityTarget(charge)
                if (!opacityTarget) {
                    scene.remove(charge)
                    disposeProjectile(charge)
                    resolve()
                    return
                }
                gsap.to(opacityTarget, {
                    opacity: 0,
                    duration: 0.18,
                    onComplete: () => {
                        scene.remove(charge)
                        disposeProjectile(charge)
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

            if (index > 0) {
                await new Promise<void>((r) => gsap.delayedCall(index * 0.1, r))
            }

            await fireBurstToward(scene, sourcePos, targetMesh, energyColor)
        }),
    )
}
