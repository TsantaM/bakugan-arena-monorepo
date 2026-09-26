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
 * Enigme du Sphinx — Manion.
 *
 * 1) Manion se fige, immobile comme la pierre
 * 2) l'enigme se propage lentement sur tout le plateau
 * 3) elle se referme sur lui : l'adversaire restera bloque un tour
 */
export async function EnigmeDuSphinxAnimation(ctx: CustomAnimationContext): Promise<void> {
    const source = meshOf(ctx, ctx.data.sourceBakugan)
    if (!source) return

    const colors = attributePalette("Subterra", { color: 0xfde68a, amount: 0.35 })

    await playCastCharge({ ctx, source, colors, scale: 1.1, density: 80, duration: 0.5 })

    await playBoardWave({
        ctx,
        origin: groundPositionOf(source),
        colors,
        radius: 8,
        holdDuration: 1.2,
    })

    await playStatusHalo({ ctx, target: source, colors, pulses: 2, radius: 0.8 })
}
