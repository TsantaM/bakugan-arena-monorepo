import * as THREE from "three"
import gsap from "gsap"

export type FissureSurfaceOptions = {
    /** Parent that receives the fissure overlay group (same local space as the surface). */
    parent: THREE.Object3D
    /** Local center of the surface. Defaults to (0, 0, 0). */
    position?: THREE.Vector3
    width: number
    height: number
    /** Offset above the surface along local Z. */
    zOffset?: number
    crackColor?: THREE.ColorRepresentation
    mainCrackCount?: number
    extraCrackCount?: number
    /** Optional mesh/sprite to shake while cracks appear. */
    shakeTarget?: THREE.Object3D
    shakeAmount?: { x?: number; y?: number }
    /** Fade cracks out after reveal (default true). */
    fadeOut?: boolean
    fadeOutDelay?: number
    revealDuration?: number
    stagger?: number
}

function disposeLine(line: THREE.Line) {
    line.geometry.dispose()
    ;(line.material as THREE.Material).dispose()
}

function buildCrackPoints(
    angle: number,
    length: number,
    segments: number,
    jaggedness: number,
    z: number,
): THREE.Vector3[] {
    const points: THREE.Vector3[] = [new THREE.Vector3(0, 0, z)]
    const dir = new THREE.Vector3(Math.cos(angle), Math.sin(angle), 0)
    const perp = new THREE.Vector3(-dir.y, dir.x, 0)

    for (let i = 1; i <= segments; i++) {
        const t = i / segments
        const along = length * t
        const offset = (Math.random() - 0.5) * jaggedness * (0.35 + t)
        points.push(
            new THREE.Vector3(
                dir.x * along + perp.x * offset,
                dir.y * along + perp.y * offset,
                z,
            ),
        )
    }

    return points
}

function createCrackLine(
    points: THREE.Vector3[],
    color: THREE.ColorRepresentation,
): THREE.Line {
    const geometry = new THREE.BufferGeometry().setFromPoints(points)
    geometry.setDrawRange(0, 0)
    const material = new THREE.LineBasicMaterial({
        color,
        transparent: true,
        opacity: 0,
        depthWrite: false,
    })
    return new THREE.Line(geometry, material)
}

function createFissureLines({
    width,
    height,
    crackZ,
    color,
    mainCrackCount,
    extraCrackCount,
}: {
    width: number
    height: number
    crackZ: number
    color: THREE.ColorRepresentation
    mainCrackCount: number
    extraCrackCount: number
}): THREE.Line[] {
    const cracks: THREE.Line[] = []
    const maxRadius = Math.hypot(width, height) * 0.52

    for (let i = 0; i < mainCrackCount; i++) {
        const angle = (i / mainCrackCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.35
        const length = maxRadius * (0.75 + Math.random() * 0.3)
        cracks.push(
            createCrackLine(buildCrackPoints(angle, length, 10, 0.45, crackZ), color),
        )

        const branchCount = 1 + Math.floor(Math.random() * 2)
        for (let b = 0; b < branchCount; b++) {
            const startT = 0.35 + Math.random() * 0.4
            const branchAngle =
                angle + (Math.random() > 0.5 ? 1 : -1) * (0.6 + Math.random() * 0.7)
            const branchLen = length * (0.25 + Math.random() * 0.3)
            const branchPoints = buildCrackPoints(branchAngle, branchLen, 6, 0.28, crackZ)
            const origin = new THREE.Vector3(
                Math.cos(angle) * length * startT,
                Math.sin(angle) * length * startT,
                crackZ,
            )
            branchPoints.forEach((p) => p.add(origin))
            cracks.push(createCrackLine(branchPoints, color))
        }
    }

    for (let i = 0; i < extraCrackCount; i++) {
        const angle = Math.random() * Math.PI * 2
        cracks.push(
            createCrackLine(
                buildCrackPoints(
                    angle,
                    maxRadius * (0.35 + Math.random() * 0.25),
                    5,
                    0.3,
                    crackZ,
                ),
                color,
            ),
        )
    }

    return cracks
}

/**
 * Plays a crack/fissure reveal on any planar surface (gate card, plane, etc.).
 * Cracks grow from the local center outward, then optionally fade out.
 */
export async function playFissureOnSurface({
    parent,
    position,
    width,
    height,
    zOffset = 0.03,
    crackColor = 0x0a0612,
    mainCrackCount = 7,
    extraCrackCount = 4,
    shakeTarget,
    shakeAmount = { x: 0.05, y: 0.035 },
    fadeOut = true,
    fadeOutDelay = 0.05,
    revealDuration = 0.45,
    stagger = 0.035,
}: FissureSurfaceOptions): Promise<void> {
    const group = new THREE.Group()
    if (position) group.position.copy(position)
    parent.add(group)

    const cracks = createFissureLines({
        width,
        height,
        crackZ: zOffset,
        color: crackColor,
        mainCrackCount,
        extraCrackCount,
    })
    cracks.forEach((line) => group.add(line))

    const shakeOrigin = shakeTarget?.position.clone()

    try {
        await new Promise<void>((resolve) => {
            const tl = gsap.timeline({
                onComplete: () => {
                    if (shakeTarget && shakeOrigin) {
                        shakeTarget.position.copy(shakeOrigin)
                    }
                    resolve()
                },
            })

            cracks.forEach((line, index) => {
                const total = line.geometry.attributes.position.count
                const reveal = { count: 0 }
                const delay = index * stagger

                tl.to(
                    line.material,
                    {
                        opacity: 0.95,
                        duration: 0.12,
                        delay,
                        ease: "power1.out",
                    },
                    0,
                )

                tl.to(
                    reveal,
                    {
                        count: total,
                        duration: revealDuration,
                        delay,
                        ease: "power2.out",
                        onUpdate: () => {
                            line.geometry.setDrawRange(
                                0,
                                Math.max(2, Math.floor(reveal.count)),
                            )
                        },
                    },
                    0,
                )
            })

            if (shakeTarget && shakeOrigin) {
                const ax = shakeAmount.x ?? 0.05
                const ay = shakeAmount.y ?? 0.035

                tl.to(
                    shakeTarget.position,
                    {
                        x: shakeOrigin.x + ax,
                        duration: 0.04,
                        yoyo: true,
                        repeat: 7,
                        ease: "power1.inOut",
                    },
                    0.1,
                )

                tl.to(
                    shakeTarget.position,
                    {
                        y: shakeOrigin.y + ay,
                        duration: 0.05,
                        yoyo: true,
                        repeat: 5,
                        ease: "power1.inOut",
                    },
                    0.12,
                )
            }
        })

        if (fadeOut) {
            await new Promise<void>((resolve) => {
                const tl = gsap.timeline({ onComplete: resolve })
                cracks.forEach((line) => {
                    tl.to(
                        line.material,
                        {
                            opacity: 0,
                            duration: 0.35,
                            ease: "power1.in",
                        },
                        fadeOutDelay,
                    )
                })
            })
        }
    } finally {
        if (shakeTarget && shakeOrigin) {
            gsap.killTweensOf(shakeTarget.position)
            shakeTarget.position.copy(shakeOrigin)
        }

        cracks.forEach((line) => {
            gsap.killTweensOf(line.material)
            group.remove(line)
            disposeLine(line)
        })
        parent.remove(group)
    }
}
