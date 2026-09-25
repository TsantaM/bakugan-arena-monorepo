import { playWaterDropImpact } from "../../../effects"
import type { CustomAnimationContext } from "../../types"
import { playElementaryGateSequence } from "./elementary-gate-sequence"

/**
 * Réacteur Aquos — the arena is flooded: drops crash on the gate and on every
 * boosted bakugan, spreading ripples across the board.
 */
export async function ElementaryAquosAnimation(ctx: CustomAnimationContext): Promise<void> {
    await playElementaryGateSequence({
        ctx,
        attribut: "Aquos",
        environment: async ({ scene, plane, gatePosition, boostedMeshes, color }) => {
            const impacts = await Promise.all([
                playWaterDropImpact({
                    scene,
                    plane,
                    impactWorld: gatePosition.clone(),
                    color,
                    waveCount: 4,
                    dropFallHeight: 4,
                }),
                ...boostedMeshes.map((mesh) =>
                    playWaterDropImpact({
                        scene,
                        plane,
                        impactWorld: mesh.position.clone(),
                        color,
                        waveCount: 2,
                        dropFallHeight: 3,
                    }),
                ),
            ])

            try {
                await Promise.all(impacts.map((impact) => impact.ripplesDone))
            } finally {
                impacts.forEach((impact) => impact.dispose())
            }
        },
    })
}
