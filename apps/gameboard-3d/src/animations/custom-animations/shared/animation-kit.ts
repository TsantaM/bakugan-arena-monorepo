import type { attribut, bakuganOnSlot, slots_id } from "@bakugan-arena/game-data"
import gsap from "gsap"
import * as THREE from "three"
import { getAttributColor } from "../../../functions/get-attrubut-color"
import {
    playAttributeAuraBurst,
    playFissureOnSurface,
    playFlameParticleBurst,
    playGrayTrembleHitReaction,
    playMeteorRain,
    playPowerDrainStream,
    playRockFallImpact,
    playSceneIlluminate,
    playShockwaveRing,
    playWindTornado,
} from "../../effects"
import type { CustomAnimationContext } from "../types"

/**
 * Boite a outils partagee par les animations des capacites exclusives.
 *
 * Chaque fonction ci-dessous est une "phrase" visuelle complete et autonome
 * (une aura de lancement, un drain, une onde de choc, un scellement
 * d'emplacement…). Les animations de cartes se contentent de les enchainer
 * avec leurs propres couleurs et leur propre rythme : c'est ce qui permet
 * d'avoir une identite visuelle par carte sans reecrire la plomberie Three.js
 * a chaque fois.
 *
 * Toutes gerent elles-memes la liberation de leurs ressources.
 */

/** Dimensions de la carte portail, pour les effets de surface. */
export const GATE_WIDTH = 4
export const GATE_HEIGHT = 6
/** Hauteur a laquelle rasent les effets au sol. */
export const GROUND_Y = 0.12

export type PhraseColors = {
    core: THREE.Color
    mid: THREE.Color
    tip: THREE.Color
}

export function tween(targets: gsap.TweenTarget, vars: gsap.TweenVars): Promise<void> {
    return new Promise((resolve) => {
        gsap.to(targets, { ...vars, onComplete: resolve })
    })
}

export function wait(seconds: number): Promise<void> {
    return new Promise((resolve) => {
        gsap.delayedCall(seconds, resolve)
    })
}

/**
 * Palette derivee d'un attribut : un coeur clair, la teinte pleine, une pointe
 * sombre. `tintShift` permet de decaler la teinte vers une autre couleur pour
 * les cartes qui ne suivent pas exactement leur attribut (poison, ombre…).
 */
export function attributePalette(
    attribut: attribut,
    tintShift?: { color: THREE.ColorRepresentation; amount: number },
): PhraseColors {
    let base = new THREE.Color(getAttributColor(attribut))
    if (tintShift) {
        base = base.clone().lerp(new THREE.Color(tintShift.color), tintShift.amount)
    }

    return {
        core: base.clone().lerp(new THREE.Color(0xffffff), 0.55),
        mid: base.clone(),
        tip: base.clone().lerp(new THREE.Color(0x000000), 0.35),
    }
}

/** Le sprite d'un bakugan sur la scene, s'il est affiche. */
export function meshOf(
    ctx: CustomAnimationContext,
    bakugan: bakuganOnSlot | undefined,
): THREE.Sprite | undefined {
    if (!bakugan) return undefined
    return ctx.scene.getObjectByName(`${bakugan.key}-${bakugan.userId}`) as THREE.Sprite | undefined
}

/** Les sprites d'une liste de bakugans, ceux qui manquent etant ignores. */
export function meshesOf(
    ctx: CustomAnimationContext,
    bakugans: bakuganOnSlot[] | undefined,
): THREE.Sprite[] {
    if (!bakugans) return []
    return bakugans
        .map((bakugan) => meshOf(ctx, bakugan))
        .filter((mesh): mesh is THREE.Sprite => mesh !== undefined)
}

/** Le sprite du bakugan le plus puissant d'une liste, s'il est affiche. */
export function strongestMeshOf(
    ctx: CustomAnimationContext,
    bakugans: bakuganOnSlot[] | undefined,
): THREE.Sprite | undefined {
    if (!bakugans || bakugans.length === 0) return undefined

    const strongest = bakugans.reduce((best, b) => (b.currentPower > best.currentPower ? b : best))
    return meshOf(ctx, strongest)
}

/** Le mesh de la carte portail d'un emplacement. */
export function gateMeshOf(
    ctx: CustomAnimationContext,
    slotId: slots_id | undefined,
): THREE.Object3D | undefined {
    if (!slotId) return undefined
    return ctx.plane.getObjectByName(slotId) ?? undefined
}

/** La position au sol d'un objet. */
export function groundPositionOf(object: THREE.Object3D): THREE.Vector3 {
    const position = new THREE.Vector3()
    object.getWorldPosition(position)
    position.y = GROUND_Y
    return position
}

/**
 * Lancement : le bakugan se charge, son aura d'attribut enfle autour de lui et
 * son sprite grossit legerement. Presque toutes les cartes commencent par la.
 */
export async function playCastCharge({
    ctx,
    source,
    colors,
    scale = 1.18,
    density = 90,
    duration = 0.4,
}: {
    ctx: CustomAnimationContext
    source: THREE.Sprite
    colors: PhraseColors
    scale?: number
    density?: number
    duration?: number
}): Promise<void> {
    const homeScale = source.scale.clone()

    const aura = playAttributeAuraBurst({
        scene: ctx.scene,
        position: source.position.clone(),
        tintTarget: source,
        colors,
        shape: { count: density, sizeMin: 0.045, sizeMax: 0.12, radius: 0.95, height: 1.5 },
        expandDuration: duration,
        holdDuration: duration * 0.7,
        fadeDuration: duration * 0.8,
    })

    try {
        await Promise.all([
            tween(source.scale, {
                x: homeScale.x * scale,
                y: homeScale.y * scale,
                duration,
                ease: "power2.out",
            }),
            aura.done,
        ])
    } finally {
        aura.dispose()
        gsap.killTweensOf(source.scale)
        await tween(source.scale, {
            x: homeScale.x,
            y: homeScale.y,
            duration: duration * 0.7,
            ease: "power2.inOut",
        })
        source.scale.copy(homeScale)
    }
}

/**
 * Impact : chaque cible grisonne et tremble, l'une apres l'autre.
 * La phrase de base de tout ce qui fait mal.
 */
export async function playImpactOn({
    targets,
    colors,
    stagger = 0.08,
    shakeAmount = { x: 0.1, z: 0.08 },
}: {
    targets: THREE.Sprite[]
    colors: PhraseColors
    stagger?: number
    shakeAmount?: { x?: number; y?: number; z?: number }
}): Promise<void> {
    if (targets.length === 0) return

    await Promise.all(
        targets.map((target, index) =>
            wait(index * stagger).then(() =>
                playGrayTrembleHitReaction({
                    target,
                    grayColor: colors.tip,
                    shakeAmount,
                }),
            ),
        ),
    )
}

/**
 * Drain : la puissance est arrachee aux cibles et aspiree par le lanceur.
 */
export async function playDrainTo({
    ctx,
    destination,
    sources,
    colors,
}: {
    ctx: CustomAnimationContext
    destination: THREE.Sprite
    sources: THREE.Sprite[]
    colors: PhraseColors
}): Promise<void> {
    if (sources.length === 0) return

    const drain = playPowerDrainStream({
        scene: ctx.scene,
        sources: sources.map((mesh) => mesh.position.clone()),
        destination: destination.position.clone(),
        colors: { stream: colors.core, source: colors.mid, intake: colors.core },
        destinationMesh: destination,
        sourceMeshes: sources,
    })

    try {
        await drain.done
    } finally {
        drain.dispose()
    }
}

/**
 * Onde de choc au sol partant du lanceur, doublee d'un eclairage de scene :
 * le vocabulaire des cartes qui touchent tout le terrain.
 */
export async function playBoardWave({
    ctx,
    origin,
    colors,
    radius = 6,
    illuminate = true,
    holdDuration = 0.9,
}: {
    ctx: CustomAnimationContext
    origin: THREE.Vector3
    colors: PhraseColors
    radius?: number
    illuminate?: boolean
    holdDuration?: number
}): Promise<void> {
    const ring = playShockwaveRing({
        scene: ctx.scene,
        position: origin.clone(),
        color: colors.core,
        radius,
        count: 2,
        duration: 0.65,
    })

    const light = illuminate
        ? playSceneIlluminate({
              scene: ctx.scene,
              tint: colors.mid,
              lightMultiplier: 2.1,
              minBoostedIntensity: 1.5,
              backgroundLift: 0.28,
              riseDuration: 0.35,
              holdDuration,
              fadeDuration: 0.6,
          })
        : null

    try {
        await Promise.all([ring.done, light?.done ?? Promise.resolve()])
    } finally {
        ring.dispose()
        light?.dispose()
    }
}

/**
 * Scellement d'un emplacement : la surface se fissure et des blocs s'ecrasent
 * dessus. Utilise par tout ce qui casse, condamne ou verrouille une carte
 * portail.
 */
export async function playSlotBreak({
    ctx,
    slotId,
    colors,
    rocks = true,
}: {
    ctx: CustomAnimationContext
    slotId: slots_id | undefined
    colors: PhraseColors
    rocks?: boolean
}): Promise<void> {
    const gate = gateMeshOf(ctx, slotId)
    if (!gate) return

    playFissureOnSurface({
        parent: gate,
        width: GATE_WIDTH,
        height: GATE_HEIGHT,
        crackColor: colors.mid,
        shakeTarget: gate,
        mainCrackCount: 6,
        extraCrackCount: 9,
    })

    if (!rocks) {
        await wait(0.5)
        return
    }

    const fall = playRockFallImpact({
        scene: ctx.scene,
        position: groundPositionOf(gate),
        colors: { rock: colors.tip, highlight: colors.mid },
        shakeTarget: gate,
    })

    try {
        await fall.done
    } finally {
        fall.dispose()
    }
}

/** Tourbillon de vent, sur place ou d'un point a un autre. */
export async function playVortex({
    ctx,
    from,
    to,
    colors,
    height = 3,
    spins = 3,
    holdDuration = 0.5,
}: {
    ctx: CustomAnimationContext
    from: THREE.Vector3
    to?: THREE.Vector3
    colors: PhraseColors
    height?: number
    spins?: number
    holdDuration?: number
}): Promise<void> {
    const tornado = playWindTornado({
        scene: ctx.scene,
        position: from.clone(),
        to: to?.clone(),
        colors: { core: colors.core, mid: colors.mid, tip: colors.tip },
        shape: { count: 70, height, spread: 0.7, sizeMin: 0.06, sizeMax: 0.2, stretchY: 2.4 },
        formDuration: 0.4,
        travelDuration: to ? 0.55 : undefined,
        spins,
        holdDuration,
        fadeDuration: 0.45,
    })

    try {
        await tornado.done
    } finally {
        tornado.dispose()
    }
}

/** Gerbe de particules montante sur une position : embrasement, jaillissement. */
export async function playBurstAt({
    ctx,
    position,
    colors,
    count = 50,
    height = 2.6,
    spread = 0.9,
}: {
    ctx: CustomAnimationContext
    position: THREE.Vector3
    colors: PhraseColors
    count?: number
    height?: number
    spread?: number
}): Promise<void> {
    const burst = playFlameParticleBurst({
        scene: ctx.scene,
        position: position.clone(),
        colors,
        shape: { count, spread, height, sizeMin: 0.1, sizeMax: 0.34, stretchY: 2 },
        expandDuration: 0.42,
        holdDuration: 0.32,
        fadeDuration: 0.42,
    })

    try {
        await burst.done
    } finally {
        burst.dispose()
    }
}

/** Pluie de projectiles sur des cibles, chacune encaissant a son tour. */
export async function playRainOn({
    ctx,
    targets,
    colors,
    stagger = 0.12,
    count = 18,
}: {
    ctx: CustomAnimationContext
    targets: THREE.Sprite[]
    colors: PhraseColors
    stagger?: number
    count?: number
}): Promise<void> {
    if (targets.length === 0) return

    const handles: { done: Promise<void>; dispose: () => void }[] = []

    try {
        await Promise.all(
            targets.map((target, index) =>
                wait(index * stagger).then(() => {
                    const rain = playMeteorRain({
                        scene: ctx.scene,
                        position: target.position.clone(),
                        colors,
                        shape: {
                            count,
                            spreadX: 0.8,
                            spreadZ: 0.8,
                            fallHeight: 5,
                            sizeMin: 0.1,
                            sizeMax: 0.26,
                            stretchY: 2.4,
                        },
                        impactTarget: target,
                    })
                    handles.push(rain)
                    return rain.done
                }),
            ),
        )
    } finally {
        handles.forEach((handle) => handle.dispose())
    }
}

/**
 * Halo persistant autour d'un bakugan : la marque visuelle des statuts qui
 * durent (verrouillage, garde, carapace, condamnation).
 */
export async function playStatusHalo({
    ctx,
    target,
    colors,
    pulses = 2,
    radius = 0.8,
}: {
    ctx: CustomAnimationContext
    target: THREE.Sprite
    colors: PhraseColors
    pulses?: number
    radius?: number
}): Promise<void> {
    for (let index = 0; index < pulses; index += 1) {
        const halo = playAttributeAuraBurst({
            scene: ctx.scene,
            position: target.position.clone(),
            tintTarget: index === 0 ? target : undefined,
            colors,
            shape: { count: 54, sizeMin: 0.04, sizeMax: 0.1, radius, height: 1.1 },
            expandDuration: 0.3,
            holdDuration: 0.2,
            fadeDuration: 0.3,
        })

        try {
            await halo.done
        } finally {
            halo.dispose()
        }
    }
}
