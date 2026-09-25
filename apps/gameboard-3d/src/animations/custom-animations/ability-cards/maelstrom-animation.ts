import gsap from "gsap"
import * as THREE from "three"
import { getAttributColor } from "../../../functions/get-attrubut-color"
import { playWindTornado } from "../../effects"
import type { CustomAnimationContext } from "../types"

const GROUND_Y = 0.12
const BAKUGAN_REST_Y = 0.75
/** How high a target is lifted inside the funnel. */
const SUCTION_LIFT = 2.1
/** Fraction of the starting radius the target keeps once fully sucked in. */
const SUCTION_TIGHTNESS = 0.18
const SUCTION_SPINS = 3.5

function tween(targets: gsap.TweenTarget, vars: gsap.TweenVars): Promise<void> {
    return new Promise((resolve) => {
        gsap.to(targets, {
            ...vars,
            onComplete: resolve,
        })
    })
}

/**
 * Maelstrom — a Ventus tornado tears open on the gate and sucks every opposing
 * bakugan into its funnel: they spiral inward, are lifted and spun inside the
 * column, then dropped back once the wind dies down.
 * Plays after the POWER_CHANGE animation.
 */
export async function MaelstromAnimation({
    scene,
    data,
}: CustomAnimationContext): Promise<void> {
    const targets = data.targetBakugans ?? []
    if (targets.length === 0) return

    const sucked: {
        mesh: THREE.Sprite
        home: THREE.Vector3
        homeScale: THREE.Vector3
        startAngle: number
        startRadius: number
    }[] = []

    // Funnel center: the middle of everything it is about to swallow.
    const center = new THREE.Vector3()

    for (const target of targets) {
        const mesh = scene.getObjectByName(
            `${target.key}-${target.userId}`,
        ) as THREE.Sprite | undefined
        if (!mesh) continue

        center.add(mesh.position)
        sucked.push({
            mesh,
            home: mesh.position.clone(),
            homeScale: mesh.scale.clone(),
            startAngle: 0,
            startRadius: 0,
        })
    }

    if (sucked.length === 0) return

    center.divideScalar(sucked.length)
    center.y = GROUND_Y

    sucked.forEach((entry) => {
        const dx = entry.home.x - center.x
        const dz = entry.home.z - center.z
        entry.startAngle = Math.atan2(dz, dx)
        // Keep a minimum radius so a target standing on the center still orbits.
        entry.startRadius = Math.max(Math.sqrt(dx * dx + dz * dz), 0.9)
    })

    const ventus = new THREE.Color(getAttributColor("Ventus"))
    const core = ventus.clone().lerp(new THREE.Color(0xffffff), 0.55)
    const mid = ventus.clone()
    const tip = ventus.clone().lerp(new THREE.Color(0x14532d), 0.35)

    let tornado: ReturnType<typeof playWindTornado> | null = null

    try {
        // 1 — the tornado tears open on the gate
        tornado = playWindTornado({
            scene,
            position: center.clone(),
            colors: { core, mid, tip },
            shape: {
                count: 90,
                height: 4.2,
                spread: 1.15,
                sizeMin: 0.06,
                sizeMax: 0.2,
                stretchY: 2.8,
            },
            formDuration: 0.45,
            holdDuration: 1.5,
            spins: 5,
            fadeDuration: 0.5,
        })

        // 2 — the targets are dragged inward, lifted and spun inside the funnel
        const suction = { t: 0 }
        const suctionPromise = tween(suction, {
            t: 1,
            duration: 1.25,
            ease: "power2.in",
            onUpdate: () => {
                const t = suction.t
                sucked.forEach(({ mesh, home, homeScale, startAngle, startRadius }, index) => {
                    const direction = index % 2 === 0 ? 1 : -1
                    const angle = startAngle + direction * t * SUCTION_SPINS * Math.PI * 2
                    const radius = startRadius * (1 - (1 - SUCTION_TIGHTNESS) * t)
                    const wobble = Math.sin(t * Math.PI * 6 + index) * 0.08 * t

                    mesh.position.set(
                        center.x + Math.cos(angle) * radius,
                        home.y + SUCTION_LIFT * t + wobble,
                        center.z + Math.sin(angle) * radius,
                    )

                    const shrink = 1 - 0.3 * t
                    mesh.scale.set(homeScale.x * shrink, homeScale.y * shrink, homeScale.z)
                })
            },
        })

        await suctionPromise

        // 3 — held inside the column, battered by the wind
        const turbulence = { t: 0 }
        await tween(turbulence, {
            t: 1,
            duration: 0.75,
            ease: "none",
            onUpdate: () => {
                const t = turbulence.t
                sucked.forEach(({ mesh, home, startAngle, startRadius }, index) => {
                    const direction = index % 2 === 0 ? 1 : -1
                    const angle =
                        startAngle +
                        direction * (SUCTION_SPINS + t * 2.5) * Math.PI * 2
                    const radius = startRadius * SUCTION_TIGHTNESS

                    mesh.position.set(
                        center.x + Math.cos(angle) * radius,
                        home.y + SUCTION_LIFT + Math.sin(t * Math.PI * 8 + index) * 0.18,
                        center.z + Math.sin(angle) * radius,
                    )
                })
            },
        })

        // 4 — the wind dies and everything is dropped back down
        const release = { t: 0 }
        const dropped = sucked.map(({ mesh }) => mesh.position.clone())

        await Promise.all([
            tween(release, {
                t: 1,
                duration: 0.65,
                ease: "power2.out",
                onUpdate: () => {
                    const t = release.t
                    sucked.forEach(({ mesh, home, homeScale }, index) => {
                        const from = dropped[index]
                        mesh.position.set(
                            THREE.MathUtils.lerp(from.x, home.x, t),
                            THREE.MathUtils.lerp(from.y, BAKUGAN_REST_Y, t),
                            THREE.MathUtils.lerp(from.z, home.z, t),
                        )
                        const grow = 0.7 + 0.3 * t
                        mesh.scale.set(homeScale.x * grow, homeScale.y * grow, homeScale.z)
                    })
                },
            }),
            tornado.done,
        ])
    } finally {
        tornado?.dispose()

        sucked.forEach(({ mesh, home, homeScale }) => {
            gsap.killTweensOf(mesh.position)
            gsap.killTweensOf(mesh.scale)
            mesh.position.copy(home)
            mesh.scale.copy(homeScale)
        })
    }
}
