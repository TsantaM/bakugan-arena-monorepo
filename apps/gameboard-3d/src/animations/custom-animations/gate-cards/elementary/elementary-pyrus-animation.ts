import { playFlameParticleBurst } from "../../../effects"
import type { CustomAnimationContext } from "../../types"
import { playElementaryGateSequence } from "./elementary-gate-sequence"

/**
 * Réacteur Pyrus — the arena turns into a volcanic field: the gate erupts in a
 * column of embers and each boosted bakugan catches fire.
 */
export async function ElementaryPyrusAnimation(ctx: CustomAnimationContext): Promise<void> {
    await playElementaryGateSequence({
        ctx,
        attribut: "Pyrus",
        environment: async ({ scene, gatePosition, boostedMeshes }) => {
            const eruption = playFlameParticleBurst({
                scene,
                position: gatePosition.clone(),
                shape: { count: 90, sizeMin: 0.07, sizeMax: 0.2, height: 3.2, spread: 2.4 },
                expandDuration: 0.6,
                holdDuration: 0.25,
                fadeDuration: 0.5,
            })

            const flares = boostedMeshes.map((mesh) =>
                playFlameParticleBurst({
                    scene,
                    position: mesh.position.clone(),
                    shape: { count: 36, sizeMin: 0.05, sizeMax: 0.12, height: 1.6, spread: 1 },
                    expandDuration: 0.45,
                    holdDuration: 0.2,
                    fadeDuration: 0.4,
                }),
            )

            try {
                await Promise.all([eruption.done, ...flares.map((flare) => flare.done)])
            } finally {
                eruption.dispose()
                flares.forEach((flare) => flare.dispose())
            }
        },
    })
}
