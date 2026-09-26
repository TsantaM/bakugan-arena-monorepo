import {
    attributePalette,
    groundPositionOf,
    meshOf,
    playBoardWave,
    playBurstAt,
    playCastCharge,
} from "../shared/animation-kit"
import type { CustomAnimationContext } from "../types"

/**
 * Griffes Affamees — Fear Ripper.
 *
 * 1) les griffes se chargent
 * 2) une gerbe jaillit du sol
 * 3) l'onde s'elargit a chaque adversaire deja tombe : plus la partie est
 *    avancee, plus la carte est spectaculaire
 */
export async function GriffesAffameesAnimation(ctx: CustomAnimationContext): Promise<void> {
    const source = meshOf(ctx, ctx.data.sourceBakugan)
    if (!source) return

    const kills = Number(ctx.data.payload?.kills ?? 0)
    const attribut = ctx.data.sourceBakugan?.attribut ?? "Darkus"
    const colors = attributePalette(attribut, { color: 0x881337, amount: 0.35 })

    await playCastCharge({ ctx, source, colors, scale: 1.2 + kills * 0.04, density: 80 + kills * 15 })

    await playBurstAt({
        ctx,
        position: groundPositionOf(source),
        colors,
        count: 40 + kills * 10,
        height: 2.4 + kills * 0.3,
    })

    if (kills > 0) {
        await playBoardWave({
            ctx,
            origin: groundPositionOf(source),
            colors,
            radius: 3 + kills,
            holdDuration: 0.7,
        })
    }
}
