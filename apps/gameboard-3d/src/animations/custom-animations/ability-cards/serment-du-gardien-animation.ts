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
 * Serment du Gardien — Haos Siege.
 *
 * 1) Siege leve son bouclier : la lumiere se condense sur lui
 * 2) l'onde du serment traverse tout le plateau — la portee compte, puisque la
 *    carte couvre les autres cartes portail
 * 3) chaque allie protege s'allume au passage, un par un
 * 4) Siege pulse une derniere fois : le serment tient
 */
export async function SermentDuGardienAnimation(ctx: CustomAnimationContext): Promise<void> {
    const source = meshOf(ctx, ctx.data.sourceBakugan)
    if (!source) return

    const colors = attributePalette("Haos", { color: 0xffffff, amount: 0.2 })

    await playCastCharge({ ctx, source, colors, scale: 1.15, density: 100, duration: 0.45 })

    // Les protégés sont ailleurs sur le plateau : l'onde doit porter loin.
    await playBoardWave({
        ctx,
        origin: groundPositionOf(source),
        colors,
        radius: 8,
        holdDuration: 1,
    })

    const proteges = meshesOf(ctx, ctx.data.targetBakugans).filter((mesh) => mesh !== source)

    await Promise.all(
        proteges.map((mesh, index) =>
            wait(index * 0.1).then(() =>
                playStatusHalo({ ctx, target: mesh, colors, pulses: 1, radius: 0.85 }),
            ),
        ),
    )

    await playStatusHalo({ ctx, target: source, colors, pulses: 2, radius: 1 })
}
