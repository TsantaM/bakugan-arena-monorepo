import {
    attributePalette,
    meshOf,
    playCastCharge,
    playSlotBreak,
    playStatusHalo,
} from "../shared/animation-kit"
import type { CustomAnimationContext } from "../types"

/**
 * Carapace Tetue — Subterra Saurus.
 *
 * 1) Saurus se ramasse sur lui-meme
 * 2) la roche se referme autour de lui
 * 3) un halo mineral bat lentement : plus rien n'entre, plus rien ne sort
 */
export async function CarapaceTetueAnimation(ctx: CustomAnimationContext): Promise<void> {
    const source = meshOf(ctx, ctx.data.sourceBakugan)
    if (!source) return

    const colors = attributePalette("Subterra", { color: 0x78350f, amount: 0.3 })

    // Il se tasse au lieu de gonfler : la carapace est une posture defensive.
    await playCastCharge({ ctx, source, colors, scale: 0.88, density: 80, duration: 0.45 })

    await playSlotBreak({ ctx, slotId: ctx.data.slotId, colors })

    await playStatusHalo({ ctx, target: source, colors, pulses: 3, radius: 0.7 })
}
