import * as THREE from "three"
import { playFissureOnSurface, playRockFallImpact } from "../../../effects"
import type { CustomAnimationContext } from "../../types"
import { playElementaryGateSequence } from "./elementary-gate-sequence"

/**
 * Réacteur Subterra — the arena turns into a rocky canyon: boulders crash on
 * the gate, which cracks under the impact.
 */
export async function ElementarySubterraAnimation(ctx: CustomAnimationContext): Promise<void> {
    await playElementaryGateSequence({
        ctx,
        attribut: "Subterra",
        environment: async ({ scene, gateMesh, gatePosition, boostedMeshes, color }) => {
            const rocks = playRockFallImpact({
                scene,
                position: gatePosition.clone(),
                shape: { count: 22, spreadX: 2, spreadZ: 2.6, fallHeight: 5 },
                shakeTarget: gateMesh ?? undefined,
            })

            const debris = boostedMeshes.map((mesh) =>
                playRockFallImpact({
                    scene,
                    position: mesh.position.clone(),
                    shape: { count: 8, spreadX: 0.8, spreadZ: 0.8, fallHeight: 3 },
                    shakeTarget: mesh,
                }),
            )

            const cracks: Promise<void> = gateMesh
                ? playFissureOnSurface({
                      parent: gateMesh,
                      width: 4,
                      height: 6,
                      zOffset: 0.02,
                      crackColor: color.clone().lerp(new THREE.Color(0x000000), 0.4),
                      shakeTarget: gateMesh,
                  })
                : Promise.resolve()

            try {
                await Promise.all([
                    rocks.done,
                    ...debris.map((rock) => rock.done),
                    cracks,
                ])
            } finally {
                rocks.dispose()
                debris.forEach((rock) => rock.dispose())
            }
        },
    })
}
