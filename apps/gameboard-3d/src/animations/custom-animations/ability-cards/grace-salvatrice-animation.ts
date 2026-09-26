import {
    attributePalette,
    meshOf,
    meshesOf,
    playCastCharge,
    playStatusHalo,
} from "../shared/animation-kit"
import type { CustomAnimationContext } from "../types"

/**
 * Grace Salvatrice — Aquos Angelo.
 *
 * 1) Angelo s'illumine d'une lumiere claire
 * 2) le protege recoit un halo doux et persistant
 *
 * Miroir exact du Pacte Sanglant de Diablo : meme structure, palette inversee.
 */
export async function GraceSalvatriceAnimation(ctx: CustomAnimationContext): Promise<void> {
    const source = meshOf(ctx, ctx.data.sourceBakugan)
    const [target] = meshesOf(ctx, ctx.data.targetBakugans)

    const colors = attributePalette("Aquos", { color: 0xffffff, amount: 0.45 })

    if (source) {
        await playCastCharge({ ctx, source, colors, scale: 1.2, density: 100, duration: 0.5 })
    }

    if (!target) return

    await playStatusHalo({ ctx, target, colors, pulses: 3, radius: 0.95 })
}
