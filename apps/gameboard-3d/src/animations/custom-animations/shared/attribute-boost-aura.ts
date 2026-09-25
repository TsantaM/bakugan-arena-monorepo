import type { attribut, bakuganOnSlot } from "@bakugan-arena/game-data"
import * as THREE from "three"
import { getAttributColor } from "../../../functions/get-attrubut-color"
import { playAttributeAuraBurst } from "../../effects"

export type AttributeBoostAuraOptions = {
    scene: THREE.Scene
    /** Bakugans receiving the boost; missing meshes are skipped. */
    bakugans: bakuganOnSlot[]
    /** Drives the particle color. */
    attribut: attribut
    expandDuration?: number
    holdDuration?: number
    fadeDuration?: number
}

/**
 * Generic "this bakugan is boosted" visual: a dense particle aura in the
 * attribute color wraps every concerned bakugan at once.
 *
 * Shared by every card that grants a power boost — played right before the
 * POWER_CHANGE directive shows the numbers.
 */
export async function playAttributeBoostAura({
    scene,
    bakugans,
    attribut,
    expandDuration = 0.45,
    holdDuration = 0.35,
    fadeDuration = 0.4,
}: AttributeBoostAuraOptions): Promise<void> {
    if (bakugans.length === 0) return

    const base = new THREE.Color(getAttributColor(attribut))
    const colors = {
        core: base.clone().lerp(new THREE.Color(0xffffff), 0.55),
        mid: base.clone(),
        tip: base.clone().lerp(new THREE.Color(0x000000), 0.35),
    }

    const handles = bakugans
        .map((bakugan) => {
            const mesh = scene.getObjectByName(`${bakugan.key}-${bakugan.userId}`) as
                | THREE.Sprite
                | undefined
            if (!mesh) return null

            return playAttributeAuraBurst({
                scene,
                position: mesh.position.clone(),
                tintTarget: mesh,
                colors,
                shape: {
                    count: 84,
                    sizeMin: 0.045,
                    sizeMax: 0.11,
                    radius: 0.9,
                    height: 1.4,
                },
                expandDuration,
                holdDuration,
                fadeDuration,
            })
        })
        .filter((handle): handle is NonNullable<typeof handle> => handle !== null)

    if (handles.length === 0) return

    try {
        await Promise.all(handles.map((handle) => handle.done))
    } finally {
        handles.forEach((handle) => handle.dispose())
    }
}
