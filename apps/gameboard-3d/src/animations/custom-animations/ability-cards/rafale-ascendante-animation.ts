import {
    attributePalette,
    meshOf,
    meshesOf,
    playCastCharge,
    playVortex,
} from "../shared/animation-kit"
import type { CustomAnimationContext } from "../types"

/**
 * Rafale Ascendante — Ventus Harpus.
 *
 * 1) Harpus bat des ailes
 * 2) une rafale monte sous la cible et l'emporte vers le haut
 */
export async function RafaleAscendanteAnimation(ctx: CustomAnimationContext): Promise<void> {
    const source = meshOf(ctx, ctx.data.sourceBakugan)
    const [target] = meshesOf(ctx, ctx.data.targetBakugans)
    if (!source) return

    const colors = attributePalette("Ventus", { color: 0xecfccb, amount: 0.3 })

    await playCastCharge({ ctx, source, colors, scale: 1.18, density: 80 })

    if (!target) return

    // Le tourbillon se forme sous la cible et s'eleve : elle part avec lui.
    const lift = target.position.clone()
    lift.y += 2.2

    await playVortex({
        ctx,
        from: target.position.clone(),
        to: lift,
        colors,
        height: 3.4,
        spins: 4,
        holdDuration: 0.3,
    })
}
