import {
    attributePalette,
    groundPositionOf,
    meshOf,
    meshesOf,
    playBoardWave,
    playCastCharge,
    playDrainTo,
} from "../shared/animation-kit"
import type { CustomAnimationContext } from "../types"

/**
 * Ancre Abyssale — Aquos Warius.
 *
 * 1) Warius jette son ancre
 * 2) l'onde atteint tout le terrain
 * 3) chaque adversaire est vide de sa puissance, qui reflue vers Warius
 */
export async function AncreAbyssaleAnimation(ctx: CustomAnimationContext): Promise<void> {
    const source = meshOf(ctx, ctx.data.sourceBakugan)
    if (!source) return

    const colors = attributePalette("Aquos", { color: 0x082f49, amount: 0.4 })

    await playCastCharge({ ctx, source, colors, scale: 1.22, density: 95 })

    await playBoardWave({
        ctx,
        origin: groundPositionOf(source),
        colors,
        radius: 8,
        holdDuration: 1.2,
    })

    await playDrainTo({
        ctx,
        destination: source,
        sources: meshesOf(ctx, ctx.data.targetBakugans),
        colors,
    })
}
