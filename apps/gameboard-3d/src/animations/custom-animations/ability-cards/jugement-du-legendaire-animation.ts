import {
    attributePalette,
    groundPositionOf,
    meshOf,
    meshesOf,
    playBoardWave,
    playCastCharge,
    playImpactOn,
    playStatusHalo,
} from "../shared/animation-kit"
import type { CustomAnimationContext } from "../types"

/**
 * Jugement du Legendaire — Pyrus Apollonir.
 *
 * 1) Apollonir s'embrase de blanc
 * 2) une vague de lumiere lave la carte portail
 * 3) tous les bakugans presents, allies compris, sont remis a plat
 */
export async function JugementDuLegendaireAnimation(ctx: CustomAnimationContext): Promise<void> {
    const source = meshOf(ctx, ctx.data.sourceBakugan)
    if (!source) return

    // Blanc presque pur : c'est un effacement, pas une attaque.
    const colors = attributePalette("Pyrus", { color: 0xffffff, amount: 0.6 })

    await playCastCharge({ ctx, source, colors, scale: 1.3, density: 120, duration: 0.5 })

    await playBoardWave({
        ctx,
        origin: groundPositionOf(source),
        colors,
        radius: 6,
        holdDuration: 1.3,
    })

    const affected = meshesOf(ctx, ctx.data.targetBakugans)

    await playImpactOn({ targets: affected, colors, shakeAmount: { x: 0.05, z: 0.05 }, stagger: 0.05 })
    await Promise.all(
        affected.map((mesh) => playStatusHalo({ ctx, target: mesh, colors, pulses: 1, radius: 0.8 })),
    )
}
