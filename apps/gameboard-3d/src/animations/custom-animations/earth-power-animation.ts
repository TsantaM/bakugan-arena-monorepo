import * as THREE from "three"
import { getAttributColor } from "../../functions/get-attrubut-color"
import { playAttributeAuraBurst } from "../effects"
import type { CustomAnimationContext } from "./types"

/**
 * Earth Power — dense Subterra particle auras wrap each allied Subterra bakugan
 * before POWER_CHANGE. Uses the reusable attribute-aura effect.
 */
export async function EarthPowerAnimation({
    scene,
    data,
}: CustomAnimationContext): Promise<void> {
    const targets = data.targetBakugans?.length
        ? data.targetBakugans
        : data.sourceBakugan
          ? [data.sourceBakugan]
          : []
    if (targets.length === 0) return

    const subterra = new THREE.Color(getAttributColor("Subterra"))
    const core = subterra.clone().lerp(new THREE.Color(0xfbbf24), 0.45)
    const mid = subterra.clone()
    const tip = subterra.clone().lerp(new THREE.Color(0x78350f), 0.4)

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
