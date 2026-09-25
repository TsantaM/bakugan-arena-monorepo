import type { attribut, slots_id } from "@bakugan-arena/game-data"
import * as THREE from "three"
import { getAttributColor } from "../../../functions/get-attrubut-color"
import { playPowerDrainStream } from "../../effects"
import type { CustomAnimationContext } from "../types"
import { bakuganMesh, bakuganPosition, gatePosition } from "./shared/gate-positions"

/**
 * Shared body of the gate cards that siphon power into one bakugan.
 *
 * `sourceBakugan` is the bakugan that gains; what it drains differs per card,
 * which is the only thing each entry point below has to provide.
 */
async function playGateDrain(
    ctx: CustomAnimationContext,
    sources: THREE.Vector3[],
    { sourceMeshes = [] as THREE.Object3D[] } = {},
): Promise<void> {
    const { scene, data } = ctx
    const receiver = data.sourceBakugan
    if (!receiver || sources.length === 0) return

    const destination = bakuganPosition(scene, receiver)
    if (!destination) return

    const attribut = (data.payload?.attribut as attribut | undefined) ?? receiver.attribut
    const base = new THREE.Color(getAttributColor(attribut))

    const drain = playPowerDrainStream({
        scene,
        sources,
        destination,
        colors: {
            stream: base.clone().lerp(new THREE.Color(0xffffff), 0.45),
            source: base.clone(),
            intake: base.clone().lerp(new THREE.Color(0xffffff), 0.25),
        },
        destinationMesh: bakuganMesh(scene, receiver) ?? undefined,
        sourceMeshes,
        streamsPerSource: sources.length > 3 ? 8 : 14,
    })

    try {
        await drain.done
    } finally {
        drain.dispose()
    }
}

/**
 * Aspirateur de Puissance — power is torn from one bakugan of the slot and
 * poured into the other.
 */
export async function AspirateurDePuissanceAnimation(ctx: CustomAnimationContext): Promise<void> {
    const drained = ctx.data.targetBakugans ?? []
    const positions = drained
        .map((bakugan) => bakuganPosition(ctx.scene, bakugan))
        .filter((position): position is THREE.Vector3 => position !== null)

    const meshes = drained
        .map((bakugan) => bakuganMesh(ctx.scene, bakugan))
        .filter((mesh): mesh is THREE.Sprite => mesh !== null)

    await playGateDrain(ctx, positions, { sourceMeshes: meshes })
}

/**
 * Grand Esprit — the power does not come from bakugans but from every gate card
 * laid on the board, which give up their energy to the bakugan.
 */
export async function GrandEspritAnimation(ctx: CustomAnimationContext): Promise<void> {
    const slotIds = (ctx.data.payload?.gateSlots as slots_id[] | undefined) ?? []
    const positions = slotIds
        .map((slotId) => gatePosition(ctx.plane, slotId))
        .filter((position): position is THREE.Vector3 => position !== null)

    await playGateDrain(ctx, positions)
}

/**
 * Rechargement — every bakugan of the same attribute on the domain feeds the
 * one that opened the gate.
 */
export async function RechargementAnimation(ctx: CustomAnimationContext): Promise<void> {
    const donors = ctx.data.targetBakugans ?? []
    const positions = donors
        .map((bakugan) => bakuganPosition(ctx.scene, bakugan))
        .filter((position): position is THREE.Vector3 => position !== null)

    const meshes = donors
        .map((bakugan) => bakuganMesh(ctx.scene, bakugan))
        .filter((mesh): mesh is THREE.Sprite => mesh !== null)

    await playGateDrain(ctx, positions, { sourceMeshes: meshes })
}
