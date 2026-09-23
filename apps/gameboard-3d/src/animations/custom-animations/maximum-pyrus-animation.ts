import { Slots } from "@bakugan-arena/game-data"
import gsap from "gsap"
import * as THREE from "three"
import { getAttributColor } from "../../functions/get-attrubut-color"
import {
    playAttributeAuraBurst,
    playFissureOnSurface,
    playFlameParticleBurst,
    playFlameTornado,
    playGrayTrembleHitReaction,
    playMeteorRain,
    playSceneIlluminate,
} from "../effects"
import type { CustomAnimationContext } from "./types"

const GATE_WIDTH = 4
const GATE_HEIGHT = 6
const GROUND_Y = 0.12

type Disposable = { dispose: () => void }

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

function wait(seconds: number): Promise<void> {
    return new Promise((resolve) => {
        gsap.delayedCall(seconds, resolve)
    })
}

/** Ground-hugging ring of fire that expands from the caster across the board. */
function createShockwaveRing(color: THREE.Color): THREE.Mesh<THREE.RingGeometry, THREE.MeshBasicMaterial> {
    const geometry = new THREE.RingGeometry(0.6, 1.1, 48)
    const material = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
    })
    const ring = new THREE.Mesh(geometry, material)
    ring.rotation.x = -Math.PI / 2
    return ring
}

/** Every slot of the board, in world space, ordered from the caster outwards. */
function collectBoardPositions(
    plane: THREE.Object3D,
    origin: THREE.Vector3,
): THREE.Vector3[] {
    const positions: THREE.Vector3[] = []

    Slots.forEach((slotId) => {
        const mesh = plane.getObjectByName(slotId)
        if (!mesh) return
        const position = new THREE.Vector3()
        mesh.getWorldPosition(position)
        position.y = GROUND_Y
        positions.push(position)
    })

    return positions.sort(
        (a, b) => a.distanceToSquared(origin) - b.distanceToSquared(origin),
    )
}

/**
 * Maximum Pyrus — the strongest fire attack in the game.
 * 1) The caster ignites: dense Pyrus aura, white-hot sprite, cracked ground
 * 2) A fire shockwave rolls out and every slot of the board erupts in flames
 * 3) The whole field burns: meteor storm on the opponents, firestorm lighting
 * 4) A colossal flame tornado rises on the caster, then everything cools down
 * Runs before the POWER_CHANGE animation.
 */
export async function MaximumPyrusAnimation({
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

    const pyrus = new THREE.Color(getAttributColor("Pyrus"))
    const core = new THREE.Color(0xfff6c2)
    const mid = pyrus.clone().lerp(new THREE.Color(0xff7a00), 0.4)
    const tip = pyrus.clone().lerp(new THREE.Color(0x7f1d1d), 0.35)
    const colors = { core, mid, tip }

    const spriteMaterial = sourceMesh.material as THREE.SpriteMaterial
    const originalSpriteColor = spriteMaterial.color.clone()
    const homeScale = sourceMesh.scale.clone()

    const origin = sourceMesh.position.clone()
    origin.y = GROUND_Y

    const ring = createShockwaveRing(core.clone().lerp(mid, 0.5))
    ring.position.copy(origin)
    ring.position.y = 0.06
    scene.add(ring)

    const effects: Disposable[] = []
    let sceneFx: ReturnType<typeof playSceneIlluminate> | null = null

    const gateMesh = data.slotId ? plane.getObjectByName(data.slotId) : null

    try {
        // 1 — ignition
        const ignition = playAttributeAuraBurst({
            scene,
            position: sourceMesh.position.clone(),
            tintTarget: sourceMesh,
            colors,
            shape: { count: 110, sizeMin: 0.05, sizeMax: 0.14, radius: 1.1, height: 1.8 },
            expandDuration: 0.5,
            holdDuration: 0.4,
            fadeDuration: 0.4,
        })
        effects.push(ignition)

        const groundFlames = playFlameParticleBurst({
            scene,
            position: origin.clone(),
            colors,
            shape: { count: 60, spread: 0.9, height: 2.6, sizeMin: 0.14, sizeMax: 0.4, stretchY: 2 },
            expandDuration: 0.45,
            holdDuration: 0.35,
            fadeDuration: 0.4,
        })
        effects.push(groundFlames)

        await Promise.all([
            tween(sourceMesh.scale, {
                x: homeScale.x * 1.3,
                y: homeScale.y * 1.3,
                duration: 0.45,
                ease: "power2.out",
            }),
            wait(0.45),
        ])

        if (gateMesh) {
            playFissureOnSurface({
                parent: gateMesh,
                width: GATE_WIDTH,
                height: GATE_HEIGHT,
                crackColor: mid,
                shakeTarget: gateMesh,
                mainCrackCount: 7,
                extraCrackCount: 10,
            })
        }

        // 2 — fire shockwave + every slot erupts
        sceneFx = playSceneIlluminate({
            scene,
            tint: mid,
            lightMultiplier: 2.6,
            minBoostedIntensity: 1.8,
            backgroundLift: 0.35,
            riseDuration: 0.45,
            holdDuration: 2.4,
            fadeDuration: 0.8,
        })

        const shockwave = Promise.all([
            tween(ring.material, { opacity: 0.9, duration: 0.2, ease: "power2.out" }),
            tween(ring.scale, { x: 9, y: 9, z: 9, duration: 0.9, ease: "power2.out" }),
        ]).then(() => tween(ring.material, { opacity: 0, duration: 0.35, ease: "power1.in" }))

        const boardPositions = collectBoardPositions(plane, origin)
        const eruptions = boardPositions.map((position, index) =>
            wait(index * 0.11).then(() => {
                const burst = playFlameParticleBurst({
                    scene,
                    position,
                    colors,
                    shape: {
                        count: 46,
                        spread: 1.1,
                        height: 3.2,
                        sizeMin: 0.13,
                        sizeMax: 0.42,
                        stretchY: 2.2,
                    },
                    expandDuration: 0.5,
                    holdDuration: 0.5,
                    fadeDuration: 0.5,
                })
                effects.push(burst)
                return burst.done
            }),
        )

        await Promise.all([shockwave, ...eruptions])

        // 3 — meteor storm on everything that stands in the way
        const targets = data.targetBakugans ?? []
        const impacts = targets.map((target, index) => {
            const targetMesh = scene.getObjectByName(
                `${target.key}-${target.userId}`,
            ) as THREE.Sprite | undefined
            if (!targetMesh) return Promise.resolve()

            return wait(index * 0.15).then(() => {
                const rain = playMeteorRain({
                    scene,
                    position: targetMesh.position.clone(),
                    colors,
                    shape: {
                        count: 22,
                        spreadX: 0.9,
                        spreadZ: 0.9,
                        fallHeight: 5.5,
                        sizeMin: 0.12,
                        sizeMax: 0.3,
                        stretchY: 2.6,
                    },
                    impactTarget: targetMesh,
                })
                effects.push(rain)
                return rain.done.then(() =>
                    playGrayTrembleHitReaction({
                        target: targetMesh,
                        grayColor: tip,
                        shakeAmount: { x: 0.12, z: 0.1 },
                    }),
                )
            })
        })

        // ...while a firestorm keeps raining over the rest of the board
        const storm = boardPositions.slice(0, 4).map((position, index) =>
            wait(index * 0.18).then(() => {
                const rain = playMeteorRain({
                    scene,
                    position,
                    colors,
                    shape: {
                        count: 12,
                        spreadX: 1.4,
                        spreadZ: 1.4,
                        fallHeight: 6,
                        sizeMin: 0.1,
                        sizeMax: 0.26,
                        stretchY: 2.4,
                    },
                })
                effects.push(rain)
                return rain.done
            }),
        )

        await Promise.all([...impacts, ...storm])

        // 4 — colossal flame tornado on the caster
        const tornado = playFlameTornado({
            scene,
            from: origin.clone(),
            to: origin.clone(),
            colors,
            shape: {
                count: 90,
                height: 4.6,
                spread: 0.85,
                sizeMin: 0.14,
                sizeMax: 0.46,
                stretchY: 2.4,
            },
            formDuration: 0.5,
            travelDuration: 0.6,
            spins: 4,
            holdDuration: 0.5,
            fadeDuration: 0.5,
        })
        effects.push(tornado)

        await Promise.all([
            tornado.done,
            tween(spriteMaterial.color, {
                r: core.r,
                g: core.g,
                b: core.b,
                duration: 0.5,
                ease: "power1.out",
            }),
        ])

        await Promise.all([
            sceneFx.done,
            tween(spriteMaterial.color, {
                r: originalSpriteColor.r,
                g: originalSpriteColor.g,
                b: originalSpriteColor.b,
                duration: 0.45,
                ease: "power1.inOut",
            }),
            tween(sourceMesh.scale, {
                x: homeScale.x,
                y: homeScale.y,
                duration: 0.45,
                ease: "power2.inOut",
            }),
        ])
    } finally {
        sceneFx?.dispose()
        effects.forEach((effect) => effect.dispose())

        gsap.killTweensOf(spriteMaterial.color)
        gsap.killTweensOf(sourceMesh.scale)
        gsap.killTweensOf(ring.scale)
        gsap.killTweensOf(ring.material)

        spriteMaterial.color.copy(originalSpriteColor)
        sourceMesh.scale.copy(homeScale)

        scene.remove(ring)
        disposeObject(ring)
    }
}
