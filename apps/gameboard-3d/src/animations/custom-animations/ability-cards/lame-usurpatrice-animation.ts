import {
    attributePalette,
    meshOf,
    playCastCharge,
    playStatusHalo,
    playVortex,
} from "../shared/animation-kit"
import type { CustomAnimationContext } from "../types"

/**
 * Lame Usurpatrice — Darkus Siege.
 *
 * 1) l'ombre monte autour de Siege
 * 2) une spirale sombre tourne a l'envers : la capacite adverse est saisie
 * 3) elle se referme sur Siege, qui l'a faite sienne
 */
export async function LameUsurpatriceAnimation(ctx: CustomAnimationContext): Promise<void> {
    const source = meshOf(ctx, ctx.data.sourceBakugan)
    if (!source) return

    const colors = attributePalette("Darkus", { color: 0x1e1b4b, amount: 0.25 })

    await playCastCharge({ ctx, source, colors, scale: 1.2, density: 85 })

    await playVortex({
        ctx,
        from: source.position.clone(),
        colors,
        height: 2.8,
        // Rotation inversee : la capacite est reprise, pas lancee.
        spins: -3,
        holdDuration: 0.5,
    })

    await playStatusHalo({ ctx, target: source, colors, pulses: 2, radius: 0.9 })
}
