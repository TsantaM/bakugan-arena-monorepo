import {
    attributePalette,
    groundPositionOf,
    meshOf,
    meshesOf,
    playBurstAt,
    playCastCharge,
    playImpactOn,
} from "../shared/animation-kit"
import type { CustomAnimationContext } from "../types"

/**
 * Pique Incendiaire — Pyrus Falconeer.
 *
 * 1) Falconeer s'embrase avant de plonger
 * 2) le sol s'enflamme a son point de chute
 * 3) la proie encaisse le choc
 *
 * Jouee pendant le deplacement : c'est la trainee du piquer.
 */
export async function PiqueIncendiaireAnimation(ctx: CustomAnimationContext): Promise<void> {
    const source = meshOf(ctx, ctx.data.sourceBakugan)
    if (!source) return

    const colors = attributePalette("Pyrus", { color: 0xfb923c, amount: 0.2 })

    await playCastCharge({ ctx, source, colors, scale: 1.3, duration: 0.32 })

    await playBurstAt({
        ctx,
        position: groundPositionOf(source),
        colors,
        count: 58,
        height: 3,
        spread: 0.8,
    })

    await playImpactOn({
        targets: meshesOf(ctx, ctx.data.targetBakugans),
        colors,
        shakeAmount: { x: 0.14, z: 0.1 },
    })
}
