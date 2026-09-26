import {
    attributePalette,
    groundPositionOf,
    meshOf,
    playBoardWave,
    playBurstAt,
    playCastCharge,
    playStatusHalo,
    playVortex,
} from "../shared/animation-kit"
import type { CustomAnimationContext } from "../types"

/**
 * Moisson des Ames — Darkus Reaper.
 *
 * 1) la faux se leve : Reaper se charge d'ombre
 * 2) une vague traverse le cimetiere, d'autant plus large qu'il est rempli
 * 3) les ames remontent du sol et tourbillonnent jusqu'a lui
 * 4) un halo se noue : la moisson des allies, elle, ne repart plus
 *
 * Deux lectures pour une meme cle : la fauche initiale, ample, et le retour de
 * Reaper sur le terrain (`restored`), plus bref — c'est un rappel, pas une
 * nouvelle moisson.
 */
export async function MoissonDesAmesAnimation(ctx: CustomAnimationContext): Promise<void> {
    const source = meshOf(ctx, ctx.data.sourceBakugan)
    if (!source) return

    const payload = ctx.data.payload ?? {}
    const restored = payload.restored === true
    const fallenAllies = Number(payload.fallenAllies ?? 0)
    const fromOpponents = Number(payload.fromOpponents ?? 0)

    // Violet Darkus tire vers le vert spectral des ames.
    const colors = attributePalette("Darkus", { color: 0x4ade80, amount: 0.22 })

    const origin = groundPositionOf(source)

    await playCastCharge({
        ctx,
        source,
        colors,
        // La faux se leve haut sur une vraie fauche, a peine sur un rappel.
        scale: restored ? 1.1 : 1.24 + fallenAllies * 0.03,
        density: restored ? 70 : 90 + fallenAllies * 12,
        duration: restored ? 0.3 : 0.45,
    })

    if (!restored) {
        // Le cimetiere rend ce qu'il garde : plus il est rempli, plus loin porte
        // la fauche. La lumiere ne monte que si l'adversaire a paye, lui aussi.
        await playBoardWave({
            ctx,
            origin,
            colors,
            radius: 3.5 + fallenAllies * 1.2,
            illuminate: fromOpponents > 0,
            holdDuration: 0.9,
        })
    }

    // Les ames remontent du sol, puis s'enroulent autour de Reaper.
    await playBurstAt({
        ctx,
        position: origin,
        colors,
        count: restored ? 30 : 42 + fallenAllies * 8,
        height: restored ? 2 : 2.6 + fallenAllies * 0.25,
        spread: restored ? 0.7 : 1.1,
    })

    await playVortex({
        ctx,
        from: origin,
        colors,
        height: restored ? 2.2 : 3.4,
        spins: restored ? 2 : 4,
        holdDuration: restored ? 0.25 : 0.55,
    })

    // Le halo marque la part qui reste acquise : celle des allies tombes.
    if (fallenAllies > 0) {
        await playStatusHalo({
            ctx,
            target: source,
            colors,
            pulses: restored ? 1 : 2,
            radius: 0.85,
        })
    }
}
