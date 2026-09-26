import {
    attributePalette,
    meshOf,
    meshesOf,
    playCastCharge,
    playImpactOn,
    playRainOn,
    playStatusHalo,
} from "../shared/animation-kit"
import type { CustomAnimationContext } from "../types"

/**
 * Verdict du Bourreau — Darkus Warius.
 *
 * 1) Warius leve sa sentence
 * 2) une pluie sombre s'abat sur le condamne, ou qu'il soit
 * 3) la marque reste sur lui : elle ne tombera qu'a la fin du combat
 */
export async function VerdictDuBourreauAnimation(ctx: CustomAnimationContext): Promise<void> {
    const source = meshOf(ctx, ctx.data.sourceBakugan)
    const targets = meshesOf(ctx, ctx.data.targetBakugans)

    const colors = attributePalette("Darkus", { color: 0x000000, amount: 0.3 })

    if (source) {
        await playCastCharge({ ctx, source, colors, scale: 1.25, density: 100 })
    }

    if (targets.length === 0) return

    await playRainOn({ ctx, targets, colors, count: 20 })
    await playImpactOn({ targets, colors, shakeAmount: { x: 0.1, z: 0.1 } })

    await Promise.all(
        targets.map((target) => playStatusHalo({ ctx, target, colors, pulses: 2, radius: 0.8 })),
    )
}
