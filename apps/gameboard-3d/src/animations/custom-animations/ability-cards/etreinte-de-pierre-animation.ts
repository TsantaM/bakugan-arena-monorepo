import {
    attributePalette,
    meshOf,
    meshesOf,
    playCastCharge,
    playImpactOn,
    playSlotBreak,
    playStatusHalo,
} from "../shared/animation-kit"
import type { CustomAnimationContext } from "../types"

/**
 * Etreinte de Pierre — Subterra Stinglash.
 *
 * 1) Stinglash arme sa pince
 * 2) la roche se souleve sous la cible et se referme sur elle
 * 3) la cible est secouee, puis scellee sur place
 */
export async function EtreinteDePierreAnimation(ctx: CustomAnimationContext): Promise<void> {
    const source = meshOf(ctx, ctx.data.sourceBakugan)
    const [target] = meshesOf(ctx, ctx.data.targetBakugans)
    if (!source) return

    const colors = attributePalette("Subterra", { color: 0x44403c, amount: 0.3 })

    await playCastCharge({ ctx, source, colors, scale: 1.16, density: 75 })

    if (!target) return

    await playSlotBreak({ ctx, slotId: ctx.data.slotId, colors })

    await playImpactOn({ targets: [target], colors, shakeAmount: { x: 0.12, z: 0.12 } })
    await playStatusHalo({ ctx, target, colors, pulses: 2, radius: 0.72 })
}
