import type { attribut, bakuganOnSlot } from "@bakugan-arena/game-data"
import * as THREE from "three"
import { getAttributColor } from "../../../../functions/get-attrubut-color"
import { playAttributeEnvironmentShift } from "../../../effects"
import { playAttributeBoostAura } from "../../shared/attribute-boost-aura"
import type { CustomAnimationContext } from "../../types"

export type ElementaryEnvironmentContext = {
    scene: THREE.Scene
    camera: THREE.PerspectiveCamera
    /** Board plane (slot meshes are its children). */
    plane: THREE.Mesh
    /** Gate mesh that just opened, when the slot is known. */
    gateMesh: THREE.Object3D | null
    /** World position of the gate — falls back to the board center. */
    gatePosition: THREE.Vector3
    /** Meshes of the bakugans about to be boosted. */
    boostedMeshes: THREE.Sprite[]
    attribut: attribut
    /** Attribute color, already resolved. */
    color: THREE.Color
}

export type ElementaryGateSequenceOptions = {
    ctx: CustomAnimationContext
    attribut: attribut
    /**
     * Attribute-specific flourish, played once the environment is in place and
     * before the boost aura. This is what makes each element feel different.
     */
    environment: (env: ElementaryEnvironmentContext) => Promise<void>
    /** Opacity of the environment backdrop (some elements want it darker). */
    environmentIntensity?: number
    /** Light tinting of the environment (0–1). */
    environmentLightTint?: number
}

function resolveBoostedMeshes(
    scene: THREE.Scene,
    bakugans: bakuganOnSlot[],
): THREE.Sprite[] {
    return bakugans
        .map(
            (bakugan) =>
                scene.getObjectByName(`${bakugan.key}-${bakugan.userId}`) as
                    | THREE.Sprite
                    | undefined,
        )
        .filter((mesh): mesh is THREE.Sprite => mesh !== undefined)
}

/**
 * Shared skeleton of the elementary gate cards (Réacteur *):
 *
 *   1. the arena turns into the environment of the attribute (+ its own flourish)
 *   2. the generic boost aura wraps every boosted bakugan
 *   3. the environment fades back — POWER_CHANGE then shows the numbers
 *
 * Each attribute only provides step 1's flourish; steps 2 and 3 are common.
 */
export async function playElementaryGateSequence({
    ctx,
    attribut,
    environment,
    environmentIntensity,
    environmentLightTint,
}: ElementaryGateSequenceOptions): Promise<void> {
    const { scene, camera, plane, data } = ctx
    const boosted = data.targetBakugans ?? []

    const gateMesh = data.slotId ? (plane.getObjectByName(data.slotId) ?? null) : null
    const gatePosition = gateMesh
        ? gateMesh.getWorldPosition(new THREE.Vector3())
        : new THREE.Vector3(0, 0, 0)

    const shift = playAttributeEnvironmentShift({
        scene,
        attribut,
        intensity: environmentIntensity,
        lightTint: environmentLightTint,
    })

    try {
        await shift.settled

        await environment({
            scene,
            camera,
            plane,
            gateMesh,
            gatePosition,
            boostedMeshes: resolveBoostedMeshes(scene, boosted),
            attribut,
            color: new THREE.Color(getAttributColor(attribut)),
        })

        await playAttributeBoostAura({ scene, bakugans: boosted, attribut })

        await shift.release()
    } finally {
        shift.dispose()
    }
}
