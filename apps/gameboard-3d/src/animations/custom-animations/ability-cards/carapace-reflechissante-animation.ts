import {
    attributePalette,
    meshOf,
    playCastCharge,
    playStatusHalo,
} from "../shared/animation-kit"
import type { CustomAnimationContext } from "../types"

/**
 * Carapace Reflechissante — Aquos Juggernoid.
 *
 * 1) Juggernoid rentre dans sa coque
 * 2) une surface claire et miroitante se referme sur lui, prete a renvoyer
 *    le prochain coup
 */
export async function CarapaceReflechissanteAnimation(ctx: CustomAnimationContext): Promise<void> {
    const source = meshOf(ctx, ctx.data.sourceBakugan)
    if (!source) return

    const colors = attributePalette("Aquos", { color: 0xe0f2fe, amount: 0.5 })

    // Il se retracte : la carapace est une fermeture, pas une charge.
    await playCastCharge({ ctx, source, colors, scale: 0.85, density: 85, duration: 0.4 })

    await playStatusHalo({ ctx, target: source, colors, pulses: 3, radius: 0.65 })
}
