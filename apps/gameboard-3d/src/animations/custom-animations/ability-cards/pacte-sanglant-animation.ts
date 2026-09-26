import {
    attributePalette,
    groundPositionOf,
    meshOf,
    playBoardWave,
    playCastCharge,
    playStatusHalo,
} from "../shared/animation-kit"
import type { CustomAnimationContext } from "../types"

/**
 * Pacte Sanglant — Aquos Diablo.
 *
 * 1) Diablo se charge d'une lueur sombre et sanglante
 * 2) un cercle de pacte se grave au sol autour de lui
 * 3) trois battements scellent le marche — il gagne en puissance, il joue sa vie
 */
export async function PacteSanglantAnimation(ctx: CustomAnimationContext): Promise<void> {
    const source = meshOf(ctx, ctx.data.sourceBakugan)
    if (!source) return

    // Aquos vire au rouge sombre : ce n'est plus de l'eau, c'est un serment.
    const colors = attributePalette("Aquos", { color: 0x7f1d1d, amount: 0.6 })

    await playCastCharge({ ctx, source, colors, scale: 1.34, density: 120, duration: 0.5 })

    await playBoardWave({
        ctx,
        origin: groundPositionOf(source),
        colors,
        radius: 3.2,
        holdDuration: 1,
    })

    await playStatusHalo({ ctx, target: source, colors, pulses: 3, radius: 0.85 })
}
