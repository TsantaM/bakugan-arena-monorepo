import {
    attributePalette,
    meshOf,
    meshesOf,
    playCastCharge,
    playDrainTo,
    playStatusHalo,
} from "../shared/animation-kit"
import type { CustomAnimationContext } from "../types"

/**
 * Protocole d'Escorte — Robotallion.
 *
 * 1) Robotallion se met au garde-a-vous
 * 2) un flux se tend entre lui et l'allie de reference : il se cale sur lui
 * 3) il pulse au nouveau niveau
 *
 * Le flux est une copie, pas un vol : l'allie ne perd rien.
 */
export async function ProtocoleDEscorteAnimation(ctx: CustomAnimationContext): Promise<void> {
    const source = meshOf(ctx, ctx.data.sourceBakugan)
    if (!source) return

    const attribut = ctx.data.sourceBakugan?.attribut ?? "Haos"
    const colors = attributePalette(attribut, { color: 0xe2e8f0, amount: 0.35 })

    await playCastCharge({ ctx, source, colors, scale: 1.12, density: 75 })

    await playDrainTo({
        ctx,
        destination: source,
        sources: meshesOf(ctx, ctx.data.targetBakugans),
        colors,
    })

    await playStatusHalo({ ctx, target: source, colors, pulses: 2, radius: 0.85 })
}
