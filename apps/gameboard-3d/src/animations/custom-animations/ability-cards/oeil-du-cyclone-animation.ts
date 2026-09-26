import {
    attributePalette,
    gateMeshOf,
    groundPositionOf,
    meshOf,
    meshesOf,
    playBoardWave,
    playCastCharge,
    playVortex,
    wait,
} from "../shared/animation-kit"
import type { CustomAnimationContext } from "../types"

/**
 * Oeil du Cyclone — Ventus Skyress Tempete.
 *
 * 1) Skyress ouvre les ailes
 * 2) un cyclone immense se leve sur la carte portail
 * 3) chaque bakugan present y est aspire, l'un apres l'autre
 * 4) l'oeil se referme : le plateau est vide
 */
export async function OeilDuCycloneAnimation(ctx: CustomAnimationContext): Promise<void> {
    const source = meshOf(ctx, ctx.data.sourceBakugan)
    if (!source) return

    const colors = attributePalette("Ventus", { color: 0xe0f2fe, amount: 0.35 })

    await playCastCharge({ ctx, source, colors, scale: 1.28, density: 110 })

    const gate = gateMeshOf(ctx, ctx.data.slotId)
    const eye = gate ? groundPositionOf(gate) : groundPositionOf(source)

    await playVortex({ ctx, from: eye, colors, height: 4.6, spins: 5, holdDuration: 0.8 })

    // Chaque bakugan est happe vers l'oeil du cyclone.
    const swept = meshesOf(ctx, ctx.data.targetBakugans)

    await Promise.all(
        swept.map((mesh, index) =>
            wait(index * 0.1).then(() =>
                playVortex({
                    ctx,
                    from: mesh.position.clone(),
                    to: eye,
                    colors,
                    height: 2,
                    spins: 3,
                    holdDuration: 0.2,
                }),
            ),
        ),
    )

    await playBoardWave({ ctx, origin: eye, colors, radius: 7, holdDuration: 0.7 })
}
