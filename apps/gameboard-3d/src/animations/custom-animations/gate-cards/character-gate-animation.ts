import type { attribut } from "@bakugan-arena/game-data"
import * as THREE from "three"
import { getAttributColor } from "../../../functions/get-attrubut-color"
import { playFlameParticleBurst } from "../../effects"
import { playAttributeBoostAura } from "../shared/attribute-boost-aura"
import type { CustomAnimationContext } from "../types"
import { currentGatePosition } from "./shared/gate-positions"

/**
 * Character gate cards — the card releases the energy of its owner's attribute,
 * and the bakugans of that family are wrapped in the same aura.
 *
 * Same language as the elementary gates, without the environment change: this
 * one is about the card giving its power, not about the arena changing.
 */
export async function CharacterGateAnimation(ctx: CustomAnimationContext): Promise<void> {
    const { scene, data } = ctx
    const targets = data.targetBakugans ?? []
    const attribut = (data.payload?.attribut as attribut | undefined) ?? "Haos"

    const base = new THREE.Color(getAttributColor(attribut))
    const colors = {
        core: base.clone().lerp(new THREE.Color(0xffffff), 0.65),
        mid: base.clone(),
        tip: base.clone().lerp(new THREE.Color(0x000000), 0.3),
    }

    // The energy escapes the card itself.
    const release = playFlameParticleBurst({
        scene,
        position: currentGatePosition(ctx),
        colors,
        shape: { count: 110, sizeMin: 0.06, sizeMax: 0.17, height: 3.4, spread: 1.8 },
        expandDuration: 0.6,
        holdDuration: 0.2,
        fadeDuration: 0.45,
    })

    try {
        await release.done
    } finally {
        release.dispose()
    }

    // Then the same aura wraps every bakugan the card empowers.
    await playAttributeBoostAura({ scene, bakugans: targets, attribut })
}
