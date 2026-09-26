import {
    attributePalette,
    groundPositionOf,
    meshOf,
    playBurstAt,
    playCastCharge,
    playSlotBreak,
} from "../shared/animation-kit"
import type { CustomAnimationContext } from "../types"

/**
 * Galerie d'Ombre — Darkus Wormquake.
 *
 * 1) Wormquake se comprime et s'enfonce
 * 2) la terre jaillit a l'endroit qu'il quitte
 * 3) la galerie s'effondre : la carte portail abandonnee se fissure
 */
export async function GalerieDOmbreAnimation(ctx: CustomAnimationContext): Promise<void> {
    const source = meshOf(ctx, ctx.data.sourceBakugan)
    if (!source) return

    const colors = attributePalette("Darkus", { color: 0x292524, amount: 0.35 })

    // Il se tasse avant de disparaitre sous terre.
    await playCastCharge({ ctx, source, colors, scale: 0.8, density: 70, duration: 0.35 })

    await playBurstAt({
        ctx,
        position: groundPositionOf(source),
        colors,
        count: 44,
        height: 2.2,
        spread: 0.7,
    })

    await playSlotBreak({ ctx, slotId: ctx.data.slotId, colors })
}
