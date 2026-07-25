import * as THREE from "three"
import { getAttributColor } from "../../functions/get-attrubut-color"
import { playAttributeAuraBurst } from "../effects"
import type { CustomAnimationContext } from "./types"

/**
 * Darkus power aura — dense Darkus particle auras wrap each concerned bakugan
 * (caster and/or targets) before POWER_CHANGE.
 * Shared by Épices Mortelles, Vengeance à l'Italienne, Poivre des Cayenne.
 */
export async function DarkusPowerAuraAnimation({
    scene,
    data,
}: CustomAnimationContext): Promise<void> {
    const targets = data.targetBakugans?.length
        ? data.targetBakugans
        : data.sourceBakugan
          ? [data.sourceBakugan]
          : []
    if (targets.length === 0) return

    const darkus = new THREE.Color(getAttributColor("Darkus"))
    const core = darkus.clone().lerp(new THREE.Color(0xe9d5ff), 0.45)
    const mid = darkus.clone()
    const tip = darkus.clone().lerp(new THREE.Color(0x2e1065), 0.4)

    const handles = targets
        .map((bakugan) => {
            const mesh = scene.getObjectByName(
                `${bakugan.key}-${bakugan.userId}`,
            ) as THREE.Sprite | undefined
            if (!mesh) return null

            return playAttributeAuraBurst({
                scene,
                position: mesh.position.clone(),
                tintTarget: mesh,
                colors: { core, mid, tip },
                shape: {
                    count: 80,
                    sizeMin: 0.045,
                    sizeMax: 0.11,
                    radius: 0.9,
                    height: 1.4,
                },
                expandDuration: 0.45,
                holdDuration: 0.3,
                fadeDuration: 0.35,
            })
        })
        .filter((handle): handle is NonNullable<typeof handle> => handle !== null)

    if (handles.length === 0) return

    try {
        await Promise.all(handles.map((handle) => handle.done))
    } finally {
        for (const handle of handles) {
            handle.dispose()
        }
    }
}
