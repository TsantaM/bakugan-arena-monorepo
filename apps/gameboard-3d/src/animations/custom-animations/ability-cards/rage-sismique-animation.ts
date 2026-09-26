import {
    attributePalette,
    groundPositionOf,
    meshOf,
    playBoardWave,
    playBurstAt,
    playCastCharge,
    playSlotBreak,
} from "../shared/animation-kit"
import type { CustomAnimationContext } from "../types"

/**
 * Rage Sismique — Pyrus Saurus.
 *
 * 1) Saurus rugit et se gonfle de colere
 * 2) le sol se fend sous son poids
 * 3) l'onde de rage part de lui — d'autant plus large que ses allies sont tombes
 */
export async function RageSismiqueAnimation(ctx: CustomAnimationContext): Promise<void> {
    const source = meshOf(ctx, ctx.data.sourceBakugan)
    if (!source) return

    const fallenBonus = Number(ctx.data.payload?.fallenBonus ?? 0)
    const colors = attributePalette("Pyrus", { color: 0x991b1b, amount: 0.25 })

    await playCastCharge({ ctx, source, colors, scale: 1.3, density: 100 })

    await playSlotBreak({ ctx, slotId: ctx.data.slotId, colors, rocks: false })

    await Promise.all([
        playBurstAt({ ctx, position: groundPositionOf(source), colors, count: 46, height: 2.4 }),
        playBoardWave({
            ctx,
            origin: groundPositionOf(source),
            colors,
            // Plus Saurus a perdu d'allies, plus l'onde porte loin.
            radius: 3.5 + fallenBonus / 50,
            illuminate: fallenBonus > 0,
            holdDuration: 0.7,
        }),
    ])
}
