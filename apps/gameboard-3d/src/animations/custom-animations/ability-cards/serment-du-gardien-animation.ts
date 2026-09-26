import {
    attributePalette,
    meshOf,
    meshesOf,
    playCastCharge,
    playStatusHalo,
} from "../shared/animation-kit"
import type { CustomAnimationContext } from "../types"

/**
 * Serment du Gardien — Haos Siege.
 *
 * 1) Siege leve son bouclier : une lumiere dense l'entoure
 * 2) le meme halo se pose sur chacun de ses allies
 * 3) Siege pulse une derniere fois — le serment tient
 */
export async function SermentDuGardienAnimation(ctx: CustomAnimationContext): Promise<void> {
    const source = meshOf(ctx, ctx.data.sourceBakugan)
    if (!source) return

    const colors = attributePalette("Haos", { color: 0xffffff, amount: 0.2 })

    await playCastCharge({ ctx, source, colors, scale: 1.15, density: 100, duration: 0.45 })

    const allies = meshesOf(ctx, ctx.data.targetBakugans).filter((mesh) => mesh !== source)

    await Promise.all(
        allies.map((mesh) => playStatusHalo({ ctx, target: mesh, colors, pulses: 1, radius: 0.85 })),
    )

    await playStatusHalo({ ctx, target: source, colors, pulses: 2, radius: 1 })
}
