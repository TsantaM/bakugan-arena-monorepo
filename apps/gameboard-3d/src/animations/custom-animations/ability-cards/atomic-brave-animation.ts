import gsap from "gsap"
import * as THREE from "three"
import { getAttributColor } from "../../../functions/get-attrubut-color"
import { playFissureOnSurface } from "../../effects"
import type { CustomAnimationContext } from "../types"

const GATE_WIDTH = 4
const GATE_HEIGHT = 6
const PLATE_COUNT = 8
/** Radius of the armor shell once locked around the bakugan. */
const SHELL_RADIUS = 0.78
/** Radius the plates fly in from. */
const SPAWN_RADIUS = 2.4
/** Radius the absorbed energy starts from when no opponent is on the board. */
const FALLBACK_STREAM_RADIUS = 3.2
const STREAMS_PER_SOURCE = 6

type ArmorPlate = {
    mesh: THREE.Mesh<THREE.DodecahedronGeometry, THREE.MeshStandardMaterial>
    angle: number
    height: number
}

function createArmorPlate(color: THREE.Color, size: number): ArmorPlate["mesh"] {
    const geometry = new THREE.DodecahedronGeometry(size, 0)
    const material = new THREE.MeshStandardMaterial({
        color,
        emissive: color.clone().multiplyScalar(0.4),
        emissiveIntensity: 0.6,
        roughness: 0.85,
        metalness: 0.15,
        transparent: true,
        opacity: 0,
        flatShading: true,
    })
    return new THREE.Mesh(geometry, material)
}

function createEnergyMote(color: THREE.Color, size: number): THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial> {
    const geometry = new THREE.SphereGeometry(size, 8, 8)
    const material = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
    })
    const mote = new THREE.Mesh(geometry, material)
    mote.scale.set(1, 1, 2.2)
    return mote
}

function createShellGlow(color: THREE.Color): THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial> {
    const geometry = new THREE.SphereGeometry(SHELL_RADIUS * 1.15, 24, 24)
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
 * Atomic Brave — Apollonir shifts into a bracing armored form:
 * 1) It digs in, the ground cracks under its weight
 * 2) Rock plates tear out of the board and lock into a shell around it
 * 3) Power is drained out of the opponents and swallowed by that shell
 * 4) The armor settles into a steady guard — ready to absorb what comes next
 */
export async function AtomicBraveAnimation({
    scene,
    plane,
    data,
}: CustomAnimationContext): Promise<void> {
    const source = data.sourceBakugan
    if (!source) return

    const sourceMesh = scene.getObjectByName(
        `${source.key}-${source.userId}`,
    ) as THREE.Sprite | undefined
    if (!sourceMesh) return

    const subterra = new THREE.Color(getAttributColor("Subterra"))
    const rock = subterra.clone().lerp(new THREE.Color(0x78350f), 0.35)
    const highlight = subterra.clone().lerp(new THREE.Color(0xfbbf24), 0.5)
    const energy = subterra.clone().lerp(new THREE.Color(0xfde68a), 0.6)

    const spriteMaterial = sourceMesh.material as THREE.SpriteMaterial
    const originalColor = spriteMaterial.color.clone()
    const homeScale = sourceMesh.scale.clone()
    const home = sourceMesh.position.clone()

    // The shell lives in its own group so it can spin as one piece.
    const shell = new THREE.Group()
    shell.position.copy(home)
    scene.add(shell)

    const plates: ArmorPlate[] = []
    for (let i = 0; i < PLATE_COUNT; i++) {
        const angle = (i / PLATE_COUNT) * Math.PI * 2
        const height = (i % 2 === 0 ? 0.28 : -0.24) + (Math.random() - 0.5) * 0.18
        const mesh = createArmorPlate(i % 3 === 0 ? highlight : rock, 0.2 + Math.random() * 0.1)
        mesh.position.set(
            Math.cos(angle) * SPAWN_RADIUS,
            height + (Math.random() - 0.5) * 1.6,
            Math.sin(angle) * SPAWN_RADIUS,
        )
        mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI)
        shell.add(mesh)
        plates.push({ mesh, angle, height })
    }

    const glow = createShellGlow(energy)
    shell.add(glow)

    const gateMesh = data.slotId ? plane.getObjectByName(data.slotId) : null

    // Where the absorbed power is torn from: the opponents, or the board around.
    const streamOrigins: THREE.Vector3[] = []
    const opponents = data.targetBakugans ?? []
    for (const opponent of opponents) {
        const mesh = scene.getObjectByName(
            `${opponent.key}-${opponent.userId}`,
        ) as THREE.Sprite | undefined
        if (mesh) streamOrigins.push(mesh.position.clone())
    }
    if (streamOrigins.length === 0) {
        for (let i = 0; i < 4; i++) {
            const angle = (i / 4) * Math.PI * 2
            streamOrigins.push(
                new THREE.Vector3(
                    home.x + Math.cos(angle) * FALLBACK_STREAM_RADIUS,
                    home.y,
                    home.z + Math.sin(angle) * FALLBACK_STREAM_RADIUS,
                ),
            )
        }
    }

    const motes: THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial>[] = []

    try {
        // 1 — the bakugan digs in
        await tween(sourceMesh.scale, {
            x: homeScale.x * 1.12,
            y: homeScale.y * 0.82,
            duration: 0.25,
            ease: "power2.out",
        })

        if (gateMesh) {
            playFissureOnSurface({
                parent: gateMesh,
                width: GATE_WIDTH,
                height: GATE_HEIGHT,
                crackColor: highlight,
                shakeTarget: gateMesh,
                mainCrackCount: 5,
                extraCrackCount: 6,
            })
        }

        // 2 — the armored form assembles
        await Promise.all([
            tween(sourceMesh.scale, {
                x: homeScale.x * 1.15,
                y: homeScale.y * 1.15,
                duration: 0.55,
                ease: "back.out(1.4)",
            }),
            tween(spriteMaterial.color, {
                r: highlight.r,
                g: highlight.g,
                b: highlight.b,
                duration: 0.55,
                ease: "power1.out",
            }),
            ...plates.flatMap(({ mesh, angle, height }, index) => [
                tween(mesh.material, {
                    opacity: 1,
                    duration: 0.25,
                    delay: index * 0.045,
                    ease: "power1.out",
                }),
                tween(mesh.position, {
                    x: Math.cos(angle) * SHELL_RADIUS,
                    y: height,
                    z: Math.sin(angle) * SHELL_RADIUS,
                    duration: 0.5,
                    delay: index * 0.045,
                    ease: "back.out(1.8)",
                }),
                tween(mesh.rotation, {
                    x: 0,
                    y: -angle,
                    z: 0,
                    duration: 0.5,
                    delay: index * 0.045,
                    ease: "power2.out",
                }),
            ]),
            tween(glow.material, { opacity: 0.35, duration: 0.5, ease: "power1.out" }),
        ])

        // The shell keeps turning for the rest of the animation.
        const spin = gsap.to(shell.rotation, {
            y: Math.PI * 2,
            duration: 3.2,
            ease: "none",
            repeat: -1,
        })

        // 3 — power is torn out of the opponents and swallowed
        const streams: Promise<void>[] = []
        streamOrigins.forEach((origin, originIndex) => {
            for (let i = 0; i < STREAMS_PER_SOURCE; i++) {
                const mote = createEnergyMote(energy, 0.07 + Math.random() * 0.04)
                const jitter = new THREE.Vector3(
                    (Math.random() - 0.5) * 0.7,
                    (Math.random() - 0.5) * 0.8,
                    (Math.random() - 0.5) * 0.7,
                )
                mote.position.copy(origin).add(jitter)
                mote.lookAt(home)
                scene.add(mote)
                motes.push(mote)

                const delay = originIndex * 0.12 + i * 0.09
                streams.push(
                    Promise.all([
                        tween(mote.material, {
                            opacity: 0.95,
                            duration: 0.2,
                            delay,
                            ease: "power1.out",
                        }),
                        tween(mote.position, {
                            x: home.x,
                            y: home.y,
                            z: home.z,
                            duration: 0.55,
                            delay,
                            ease: "power2.in",
                        }),
                    ]).then(() =>
                        Promise.all([
                            tween(mote.material, { opacity: 0, duration: 0.15, ease: "power1.in" }),
                            // each absorbed mote makes the shell flare
                            tween(glow.material, {
                                opacity: 0.75,
                                duration: 0.1,
                                yoyo: true,
                                repeat: 1,
                                ease: "sine.out",
                            }),
                        ]).then(() => undefined),
                    ),
                )
            }
        })

        await Promise.all(streams)

        // 4 — the guard settles: the shell tightens, pulses, then sinks into the sprite
        await Promise.all([
            ...plates.map(({ mesh, angle, height }) =>
                tween(mesh.position, {
                    x: Math.cos(angle) * SHELL_RADIUS * 0.82,
                    y: height * 0.7,
                    z: Math.sin(angle) * SHELL_RADIUS * 0.82,
                    duration: 0.35,
                    ease: "power2.inOut",
                }),
            ),
            tween(glow.material, {
                opacity: 0.6,
                duration: 0.3,
                yoyo: true,
                repeat: 3,
                ease: "sine.inOut",
            }),
        ])

        await Promise.all([
            ...plates.map(({ mesh }) =>
                Promise.all([
                    tween(mesh.material, { opacity: 0, duration: 0.4, ease: "power1.in" }),
                    tween(mesh.scale, { x: 0.3, y: 0.3, z: 0.3, duration: 0.4, ease: "power1.in" }),
                ]),
            ),
            tween(glow.material, { opacity: 0, duration: 0.45, ease: "power1.in" }),
            tween(sourceMesh.scale, {
                x: homeScale.x,
                y: homeScale.y,
                duration: 0.45,
                ease: "power2.inOut",
            }),
            tween(spriteMaterial.color, {
                r: originalColor.r,
                g: originalColor.g,
                b: originalColor.b,
                duration: 0.45,
                ease: "power1.inOut",
            }),
        ])

        spin.kill()
    } finally {
        gsap.killTweensOf(shell.rotation)
        gsap.killTweensOf(spriteMaterial.color)
        gsap.killTweensOf(sourceMesh.scale)
        plates.forEach(({ mesh }) => {
            gsap.killTweensOf(mesh.position)
            gsap.killTweensOf(mesh.rotation)
            gsap.killTweensOf(mesh.scale)
            gsap.killTweensOf(mesh.material)
        })
        gsap.killTweensOf(glow.material)
        motes.forEach((mote) => {
            gsap.killTweensOf(mote.position)
            gsap.killTweensOf(mote.material)
            scene.remove(mote)
            mote.geometry.dispose()
            mote.material.dispose()
        })

        spriteMaterial.color.copy(originalColor)
        sourceMesh.scale.copy(homeScale)

        scene.remove(shell)
        disposeObject(shell)
    }
}
