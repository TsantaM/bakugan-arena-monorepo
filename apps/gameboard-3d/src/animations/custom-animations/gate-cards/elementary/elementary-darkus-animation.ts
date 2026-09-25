import * as THREE from "three"
import { playAttributeAuraBurst } from "../../../effects"
import type { CustomAnimationContext } from "../../types"
import { playElementaryGateSequence } from "./elementary-gate-sequence"

/**
 * Réacteur Darkus — the arena sinks into darkness: a heavy shadow mist swells
 * over the gate before the boost aura lands.
 */
export async function ElementaryDarkusAnimation(ctx: CustomAnimationContext): Promise<void> {
    await playElementaryGateSequence({
        ctx,
        attribut: "Darkus",
        environmentLightTint: 0.5,
        environment: async ({ scene, gatePosition, color }) => {
            const mist = playAttributeAuraBurst({
                scene,
                position: gatePosition.clone(),
                // Additive blending on a dark board: keep the palette bright or
                // the mist is invisible.
                colors: {
                    core: new THREE.Color(0xf5e8ff),
                    mid: color.clone().lerp(new THREE.Color(0xd8b4fe), 0.55),
                    tip: color.clone(),
                },
                shape: { count: 160, sizeMin: 0.1, sizeMax: 0.3, radius: 2.6, height: 3.2 },
                expandDuration: 0.6,
                holdDuration: 0.35,
                fadeDuration: 0.5,
            })

            try {
                await mist.done
            } finally {
                mist.dispose()
            }
        },
    })
}
