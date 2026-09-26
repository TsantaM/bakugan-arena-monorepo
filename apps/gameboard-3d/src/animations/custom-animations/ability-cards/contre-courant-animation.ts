import {
    attributePalette,
    meshOf,
    meshesOf,
    playCastCharge,
    playDrainTo,
    playImpactOn,
    playVortex,
} from "../shared/animation-kit"
import type { CustomAnimationContext } from "../types"

/**
 * Contre-Courant — Aquos Garganoid.
 *
 * 1) Garganoid inverse le flux autour de lui
 * 2) le courant arrache aux adversaires ce qu'ils avaient gagne
 * 3) le ressac les frappe une seconde fois
 */
export async function ContreCourantAnimation(ctx: CustomAnimationContext): Promise<void> {
    const source = meshOf(ctx, ctx.data.sourceBakugan)
    if (!source) return

    const colors = attributePalette("Aquos", { color: 0x0e7490, amount: 0.3 })
    const targets = meshesOf(ctx, ctx.data.targetBakugans)

    await playCastCharge({ ctx, source, colors, scale: 1.2, density: 90 })

    // Rotation inversee : c'est un contre-courant.
    await playVortex({ ctx, from: source.position.clone(), colors, height: 2.6, spins: -3 })

    await playDrainTo({ ctx, destination: source, sources: targets, colors })
    await playImpactOn({ targets, colors, shakeAmount: { x: 0.12, z: 0.1 } })
}
