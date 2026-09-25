import { playSceneIlluminate } from "../../../effects"
import type { CustomAnimationContext } from "../../types"
import { playElementaryGateSequence } from "./elementary-gate-sequence"

/**
 * Réacteur Haos — the arena turns into a field of light: the whole scene is
 * flooded with brightness before the boost aura lands.
 */
export async function ElementaryHaosAnimation(ctx: CustomAnimationContext): Promise<void> {
    await playElementaryGateSequence({
        ctx,
        attribut: "Haos",
        // The illumination already washes the scene out: keep the backdrop lighter.
        environmentIntensity: 0.85,
        environmentLightTint: 0.2,
        environment: async ({ scene, color }) => {
            const light = playSceneIlluminate({
                scene,
                tint: color,
                lightMultiplier: 2.2,
                riseDuration: 0.5,
                holdDuration: 0.4,
                fadeDuration: 0.5,
            })

            try {
                await light.done
            } finally {
                light.dispose()
            }
        },
    })
}
