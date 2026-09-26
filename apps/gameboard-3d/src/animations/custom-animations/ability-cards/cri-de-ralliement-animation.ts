import {
    attributePalette,
    groundPositionOf,
    meshOf,
    meshesOf,
    playBoardWave,
    playCastCharge,
    playStatusHalo,
} from "../shared/animation-kit"
import type { CustomAnimationContext } from "../types"

/**
 * Cri de Ralliement — Haos Saurus.
 *
 * 1) Saurus rugit, sa lumiere se concentre
 * 2) l'appel se propage sur le plateau
 * 3) le renfort s'allume en arrivant sur la carte portail
 */
export async function CriDeRalliementAnimation(ctx: CustomAnimationContext): Promise<void> {
    const source = meshOf(ctx, ctx.data.sourceBakugan)
    if (!source) return

    const colors = attributePalette("Haos", { color: 0xfef9c3, amount: 0.3 })

    await playCastCharge({ ctx, source, colors, scale: 1.26, density: 95 })

    await playBoardWave({
        ctx,
        origin: groundPositionOf(source),
        colors,
        radius: 6.5,
        holdDuration: 0.8,
    })

    const reinforcements = meshesOf(ctx, ctx.data.targetBakugans)

    await Promise.all(
        reinforcements.map((mesh) =>
            playStatusHalo({ ctx, target: mesh, colors, pulses: 2, radius: 0.9 }),
        ),
    )
}
