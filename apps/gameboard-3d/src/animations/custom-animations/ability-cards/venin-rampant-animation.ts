import {
    attributePalette,
    meshOf,
    meshesOf,
    playCastCharge,
    playImpactOn,
    playStatusHalo,
    playVortex,
} from "../shared/animation-kit"
import type { CustomAnimationContext } from "../types"

/**
 * Venin Rampant — Darkus Stinglash.
 *
 * 1) le dard de Stinglash se charge
 * 2) une trainee verdatre rampe jusqu'a la cible
 * 3) la cible encaisse, puis le venin s'installe en pulsant : il reviendra
 *    a chaque tour
 */
export async function VeninRampantAnimation(ctx: CustomAnimationContext): Promise<void> {
    const source = meshOf(ctx, ctx.data.sourceBakugan)
    const [target] = meshesOf(ctx, ctx.data.targetBakugans)
    if (!source) return

    // Darkus vire au vert toxique : c'est le venin qu'on lit, pas l'attribut.
    const colors = attributePalette("Darkus", { color: 0x65a30d, amount: 0.55 })

    await playCastCharge({ ctx, source, colors, scale: 1.14, density: 70 })

    if (!target) return

    await playVortex({
        ctx,
        from: source.position.clone(),
        to: target.position.clone(),
        colors,
        height: 1.6,
        spins: 2,
        holdDuration: 0.25,
    })

    await playImpactOn({ targets: [target], colors, shakeAmount: { x: 0.06, z: 0.06 } })
    await playStatusHalo({ ctx, target, colors, pulses: 3, radius: 0.7 })
}
