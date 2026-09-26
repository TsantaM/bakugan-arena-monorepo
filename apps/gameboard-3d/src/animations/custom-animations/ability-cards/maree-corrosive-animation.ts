import {
    attributePalette,
    gateMeshOf,
    groundPositionOf,
    meshOf,
    meshesOf,
    playBoardWave,
    playCastCharge,
    playImpactOn,
    playStatusHalo,
    strongestMeshOf,
} from "../shared/animation-kit"
import type { CustomAnimationContext } from "../types"

/**
 * Maree Corrosive — Aquos Stinglash.
 *
 * 1) Stinglash libere son acide
 * 2) la maree recouvre la carte portail
 * 3) tous les adversaires fondent un peu, et le plus puissant reste empoisonne
 */
export async function MareeCorrosiveAnimation(ctx: CustomAnimationContext): Promise<void> {
    const source = meshOf(ctx, ctx.data.sourceBakugan)
    if (!source) return

    const colors = attributePalette("Aquos", { color: 0x84cc16, amount: 0.5 })

    await playCastCharge({ ctx, source, colors, scale: 1.16, density: 85 })

    const gate = gateMeshOf(ctx, ctx.data.slotId)

    await playBoardWave({
        ctx,
        origin: gate ? groundPositionOf(gate) : groundPositionOf(source),
        colors,
        radius: 4.5,
        holdDuration: 0.9,
    })

    const targets = meshesOf(ctx, ctx.data.targetBakugans)
    await playImpactOn({ targets, colors, stagger: 0.07 })

    const prime = strongestMeshOf(ctx, ctx.data.targetBakugans)
    if (prime) {
        await playStatusHalo({ ctx, target: prime, colors, pulses: 3, radius: 0.7 })
    }
}
