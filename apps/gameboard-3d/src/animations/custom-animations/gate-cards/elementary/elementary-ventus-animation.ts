import { playWindTornado } from "../../../effects"
import type { CustomAnimationContext } from "../../types"
import { playElementaryGateSequence } from "./elementary-gate-sequence"

/**
 * Réacteur Ventus — the arena turns into a storm field: a wind column rises on
 * the gate while gusts spin around each boosted bakugan.
 */
export async function ElementaryVentusAnimation(ctx: CustomAnimationContext): Promise<void> {
    await playElementaryGateSequence({
        ctx,
        attribut: "Ventus",
        environment: async ({ scene, gatePosition, boostedMeshes }) => {
            const column = playWindTornado({
                scene,
                position: gatePosition.clone(),
                shape: { count: 110, height: 4.6, spread: 2.4, sizeMin: 0.1, sizeMax: 0.26 },
                formDuration: 0.5,
                holdDuration: 0.6,
                spins: 4,
                fadeDuration: 0.45,
            })

            const gusts = boostedMeshes.map((mesh) =>
                playWindTornado({
                    scene,
                    position: mesh.position.clone(),
                    shape: { count: 40, height: 2.2, spread: 1, sizeMin: 0.07, sizeMax: 0.16 },
                    formDuration: 0.4,
                    holdDuration: 0.4,
                    spins: 2,
                    fadeDuration: 0.4,
                }),
            )

            try {
                await Promise.all([column.done, ...gusts.map((gust) => gust.done)])
            } finally {
                column.dispose()
                gusts.forEach((gust) => gust.dispose())
            }
        },
    })
}
