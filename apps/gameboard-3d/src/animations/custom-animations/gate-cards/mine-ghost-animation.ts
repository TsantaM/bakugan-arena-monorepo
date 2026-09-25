import gsap from "gsap"
import * as THREE from "three"
import {
    playFlameParticleBurst,
    playRockFallImpact,
    playSceneIlluminate,
    playShockwaveRing,
} from "../../effects"
import type { CustomAnimationContext } from "../types"
import { bakuganMesh, currentGatePosition } from "./shared/gate-positions"

/**
 * Mine Fantôme — the gate is a mine. It detonates under the bakugans standing
 * on it: flash, fireball, ground shockwave and debris, and every bakugan on the
 * slot is thrown before being eliminated.
 */
export async function MineGhostAnimation(ctx: CustomAnimationContext): Promise<void> {
    const { scene, data } = ctx
    const blast = currentGatePosition(ctx)
    const victims = (data.targetBakugans ?? [])
        .map((bakugan) => bakuganMesh(scene, bakugan))
        .filter((mesh): mesh is THREE.Sprite => mesh !== null)

    const fireball = playFlameParticleBurst({
        scene,
        position: blast,
        colors: { core: 0xfff4c2, mid: 0xff8a1f, tip: 0x7c2d12 },
        shape: { count: 150, sizeMin: 0.08, sizeMax: 0.26, height: 4.2, spread: 2.6 },
        expandDuration: 0.35,
        holdDuration: 0.15,
        fadeDuration: 0.5,
    })

    const wave = playShockwaveRing({
        scene,
        position: blast,
        color: 0xffd08a,
        radius: 5,
        count: 2,
        duration: 0.65,
    })

    const debris = playRockFallImpact({
        scene,
        position: blast,
        shape: { count: 18, spreadX: 2.4, spreadZ: 2.8, fallHeight: 4.5 },
    })

    // Short white flash, the way a detonation washes the scene out.
    const flash = playSceneIlluminate({
        scene,
        tint: 0xffd8a8,
        lightMultiplier: 3,
        riseDuration: 0.12,
        holdDuration: 0.08,
        fadeDuration: 0.45,
    })

    // The bakugans standing on the mine are thrown by the blast.
    const thrown = victims.map((mesh) => {
        const origin = mesh.position.clone()
        const direction = origin.clone().sub(blast).setY(0)
        if (direction.lengthSq() < 0.001) direction.set(Math.random() - 0.5, 0, Math.random() - 0.5)
        direction.normalize()

        return new Promise<void>((resolve) => {
            const timeline = gsap.timeline({
                onComplete: () => {
                    // Always put it back: the elimination animation follows.
                    mesh.position.copy(origin)
                    resolve()
                },
            })
            timeline
                .to(mesh.position, {
                    x: origin.x + direction.x * 1.2,
                    z: origin.z + direction.z * 1.2,
                    y: origin.y + 0.9,
                    duration: 0.28,
                    ease: "power3.out",
                })
                .to(mesh.position, {
                    y: origin.y,
                    duration: 0.35,
                    ease: "bounce.out",
                })
        })
    })

    try {
        await Promise.all([fireball.done, wave.done, debris.done, flash.done, ...thrown])
    } finally {
        fireball.dispose()
        wave.dispose()
        debris.dispose()
        flash.dispose()
    }
}
