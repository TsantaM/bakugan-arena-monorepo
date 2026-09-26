import {
    attributePalette,
    meshOf,
    playImpactOn,
    playStatusHalo,
} from "../shared/animation-kit"
import type { CustomAnimationContext } from "../types"

/**
 * Poison — animation de statut, rejouee a chaque changement de tour sur les
 * bakugans empoisonnes (cle `status:poison-tick`, emise par
 * `ApplyTurnStatusEffects`).
 *
 * Volontairement courte et discrete : elle se declenche potentiellement a
 * chaque tour, elle ne doit pas peser sur le rythme de la partie.
 */
export async function PoisonTickAnimation(ctx: CustomAnimationContext): Promise<void> {
    const target = meshOf(ctx, ctx.data.sourceBakugan)
    if (!target) return

    const colors = attributePalette(ctx.data.sourceBakugan?.attribut ?? "Darkus", {
        color: 0x65a30d,
        amount: 0.65,
    })

    await playStatusHalo({ ctx, target, colors, pulses: 1, radius: 0.6 })
    await playImpactOn({ targets: [target], colors, shakeAmount: { x: 0.04, z: 0.04 } })
}
