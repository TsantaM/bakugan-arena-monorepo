import {
    attributePalette,
    meshOf,
    meshesOf,
    playCastCharge,
    playStatusHalo,
    playVortex,
} from "../shared/animation-kit"
import type { CustomAnimationContext } from "../types"

/**
 * Rapace Eclaireur — Ventus Falconeer.
 *
 * 1) Falconeer prend de la hauteur
 * 2) une spirale de vent descend sur la cible : c'est le survol de reconnaissance
 * 3) un halo se referme sur elle — elle est repere, et reduite au silence
 */
export async function RapaceEclaireurAnimation(ctx: CustomAnimationContext): Promise<void> {
    const source = meshOf(ctx, ctx.data.sourceBakugan)
    const [target] = meshesOf(ctx, ctx.data.targetBakugans)
    if (!source) return

    const colors = attributePalette("Ventus", { color: 0xa7f3d0, amount: 0.3 })

    await playCastCharge({ ctx, source, colors, scale: 1.2, density: 70 })

    if (!target) return

    await playVortex({
        ctx,
        from: source.position.clone(),
        to: target.position.clone(),
        colors,
        height: 2.4,
        spins: 4,
        holdDuration: 0.35,
    })

    await playStatusHalo({ ctx, target, colors, pulses: 3, radius: 0.75 })
}
