import {
    attributePalette,
    groundPositionOf,
    meshOf,
    meshesOf,
    playBoardWave,
    playCastCharge,
    playStatusHalo,
    wait,
} from "../shared/animation-kit"
import type { CustomAnimationContext } from "../types"

/**
 * Souffle de la Vie Verte — Ventus Oberus.
 *
 * 1) Oberus inspire : son aura verte se condense
 * 2) une vague de vie balaie le plateau
 * 3) chaque allie se rallume a son passage — les capacites sont rendues
 */
export async function SouffleDeLaVieVerteAnimation(ctx: CustomAnimationContext): Promise<void> {
    const source = meshOf(ctx, ctx.data.sourceBakugan)
    if (!source) return

    const colors = attributePalette("Ventus", { color: 0xd9f99d, amount: 0.25 })

    await playCastCharge({ ctx, source, colors, density: 110, scale: 1.24 })

    await playBoardWave({
        ctx,
        origin: groundPositionOf(source),
        colors,
        radius: 7.5,
        holdDuration: 1.1,
    })

    const allies = meshesOf(ctx, ctx.data.targetBakugans).filter((mesh) => mesh !== source)

    // Les allies se rallument l'un apres l'autre, dans le sillage de la vague.
    await Promise.all(
        [source, ...allies].map((mesh, index) =>
            wait(index * 0.11).then(() =>
                playStatusHalo({ ctx, target: mesh, colors, pulses: 2, radius: 0.95 }),
            ),
        ),
    )
}
