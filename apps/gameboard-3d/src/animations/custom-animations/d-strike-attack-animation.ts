import * as THREE from "three"
import { getAttributColor } from "../../functions/get-attrubut-color"
import { playAttributeAuraBurst, playMeteorRain } from "../effects"
import type { CustomAnimationContext } from "./types"

/**
 * D-Strike Attack —
 * 1) Dense Pyrus aura wraps the caster (same effect as Earth Power)
 * 2) Meteor rain crashes onto each opposing bakugan on the slot
 * Then POWER_CHANGE applies.
 */
export async function DStrikeAttackAnimation({
    scene,
    data,
}: CustomAnimationContext): Promise<void> {
    const source = data.sourceBakugan
    if (!source) return

    const sourceMesh = scene.getObjectByName(
        `${source.key}-${source.userId}`,
    ) as THREE.Sprite | undefined
    if (!sourceMesh) return

    const pyrus = new THREE.Color(getAttributColor("Pyrus"))
    const core = pyrus.clone().lerp(new THREE.Color(0xfff1a8), 0.55)
    const mid = pyrus.clone().lerp(new THREE.Color(0xff8a1a), 0.25)
    const tip = pyrus.clone().lerp(new THREE.Color(0x7f1d1d), 0.3)

    const aura = playAttributeAuraBurst({
        scene,
        position: sourceMesh.position.clone(),
        tintTarget: sourceMesh,
        colors: { core, mid, tip },
        shape: {
            count: 80,
            sizeMin: 0.045,
            sizeMax: 0.11,
            radius: 0.9,
            height: 1.4,
        },
        expandDuration: 0.45,
        holdDuration: 0.25,
        fadeDuration: 0.3,
    })

    const targets = data.targetBakugans ?? []
    const rains: ReturnType<typeof playMeteorRain>[] = []

    try {
        await aura.done

        for (const target of targets) {
            const targetMesh = scene.getObjectByName(
                `${target.key}-${target.userId}`,
            ) as THREE.Sprite | undefined
            if (!targetMesh) continue

            rains.push(
                playMeteorRain({
                    scene,
                    position: targetMesh.position.clone(),
                    colors: { core, mid, tip },
                    shape: {
                        count: 16,
                        spreadX: 0.7,
                        spreadZ: 0.7,
                        fallHeight: 4.5,
                        sizeMin: 0.11,
                        sizeMax: 0.26,
                        stretchY: 2.4,
                    },
                    impactTarget: targetMesh,
                }),
            )
        }

        if (rains.length > 0) {
            await Promise.all(rains.map((rain) => rain.done))
        }
    } finally {
        aura.dispose()
        for (const rain of rains) {
            rain.dispose()
        }
    }
}
