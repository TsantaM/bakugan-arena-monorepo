import * as THREE from "three"
import gsap from "gsap"

export type GrayTrembleHitReactionOptions = {
    target: THREE.Object3D
    /** Tint applied during the hit. Defaults to gray-500. */
    grayColor?: THREE.ColorRepresentation
    /** Local shake amplitudes. */
    shakeAmount?: { x?: number; y?: number; z?: number }
    grayInDuration?: number
    restoreDuration?: number
    /** Restore original material color after the shake (default true). */
    restoreColor?: boolean
}

function getMaterialColor(target: THREE.Object3D): THREE.Color | null {
    if (target instanceof THREE.Sprite) {
        const material = target.material as THREE.SpriteMaterial
        return material?.color ?? null
    }

    if (target instanceof THREE.Mesh) {
        const material = target.material
        if (Array.isArray(material)) return null
        if (material && "color" in material) {
            return (material as THREE.MeshStandardMaterial).color
        }
    }

    return null
}

/**
 * Grays out a mesh/sprite and applies a short tremble, then optionally restores color.
 * Works on bakugan sprites, gate planes, or any Object3D with a colored material.
 */
export async function playGrayTrembleHitReaction({
    target,
    grayColor = 0x6b7280,
    shakeAmount = { x: 0.06, z: 0.04 },
    grayInDuration = 0.12,
    restoreDuration = 0.25,
    restoreColor = true,
}: GrayTrembleHitReactionOptions): Promise<void> {
    const color = getMaterialColor(target)
    if (!color) return

    const originalColor = color.clone()
    const gray = new THREE.Color(grayColor)
    const origin = target.position.clone()
    const ax = shakeAmount.x ?? 0
    const ay = shakeAmount.y ?? 0
    const az = shakeAmount.z ?? 0

    await new Promise<void>((resolve) => {
        const tl = gsap.timeline({
            onComplete: () => {
                if (restoreColor) color.copy(originalColor)
                target.position.copy(origin)
                resolve()
            },
        })

        tl.to(color, {
            r: gray.r,
            g: gray.g,
            b: gray.b,
            duration: grayInDuration,
            ease: "power1.out",
        })

        if (ax !== 0) {
            tl.to(
                target.position,
                {
                    x: origin.x + ax,
                    duration: 0.045,
                    yoyo: true,
                    repeat: 7,
                    ease: "power1.inOut",
                },
                "<",
            )
        }

        if (ay !== 0) {
            tl.to(
                target.position,
                {
                    y: origin.y + ay,
                    duration: 0.05,
                    yoyo: true,
                    repeat: 5,
                    ease: "power1.inOut",
                },
                "<",
            )
        }

        if (az !== 0) {
            tl.to(
                target.position,
                {
                    z: origin.z + az,
                    duration: 0.055,
                    yoyo: true,
                    repeat: 5,
                    ease: "power1.inOut",
                },
                "<",
            )
        }

        if (restoreColor) {
            tl.to(
                color,
                {
                    r: originalColor.r,
                    g: originalColor.g,
                    b: originalColor.b,
                    duration: restoreDuration,
                    ease: "power1.in",
                },
                "+=0.05",
            )
        }
    })
}
