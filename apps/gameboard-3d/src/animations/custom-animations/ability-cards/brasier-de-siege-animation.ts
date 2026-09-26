import {
    attributePalette,
    gateMeshOf,
    groundPositionOf,
    meshOf,
    meshesOf,
    playBurstAt,
    playCastCharge,
    playImpactOn,
} from "../shared/animation-kit"
import type { CustomAnimationContext } from "../types"

/**
 * Brasier de Siege — Pyrus Siege.
 *
 * 1) Siege met le feu autour de lui
 * 2) toute la carte portail s'embrase
 * 3) chacun encaisse, allies compris — c'est le prix de la carte
 */
export async function BrasierDeSiegeAnimation(ctx: CustomAnimationContext): Promise<void> {
    const source = meshOf(ctx, ctx.data.sourceBakugan)
    if (!source) return

    const colors = attributePalette("Pyrus", { color: 0xf97316, amount: 0.25 })

    await playCastCharge({ ctx, source, colors, scale: 1.2, density: 90 })

    const gate = gateMeshOf(ctx, ctx.data.slotId)

    await playBurstAt({
        ctx,
        position: gate ? groundPositionOf(gate) : groundPositionOf(source),
        colors,
        count: 70,
        height: 3.2,
        spread: 1.6,
    })

    await playImpactOn({
        targets: meshesOf(ctx, ctx.data.targetBakugans),
        colors,
        stagger: 0.06,
    })
}
