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
 * Brise-Muraille — Pyrus Warius.
 *
 * 1) Warius prend son elan
 * 2) il defonce la carte portail : fissures et blocs qui s'ecroulent
 * 3) l'emplacement fume — plus rien ne peut y etre pose
 */
export async function BriseMurailleAnimation(ctx: CustomAnimationContext): Promise<void> {
    const source = meshOf(ctx, ctx.data.sourceBakugan)
    if (!source) return

    const colors = attributePalette("Pyrus", { color: 0x7c2d12, amount: 0.3 })

    await playCastCharge({ ctx, source, colors, scale: 1.3, density: 95 })

    await playSlotBreak({ ctx, slotId: ctx.data.slotId, colors })

    await playBurstAt({
        ctx,
        position: groundPositionOf(source),
        colors,
        count: 36,
        height: 2,
        spread: 1.3,
    })
}
