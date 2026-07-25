import * as THREE from "three"
import { getAttributColor } from "../../functions/get-attrubut-color"
import { playFlameTornado } from "../effects"
import { playGrayTrembleHitReaction } from "../effects"
import type { CustomAnimationContext } from "./types"

/**
 * Tourbillon de Feu — a spiraling flame tornado forms on the caster
 * and travels into the opposing bakugan before POWER_CHANGE.
 */
export async function TourbillonDeFeuAnimation({
    scene,
    data,
}: CustomAnimationContext): Promise<void> {
    const source = data.sourceBakugan
    const target = data.targetBakugans?.[0]
    if (!source || !target) return

    const sourceMesh = scene.getObjectByName(
        `${source.key}-${source.userId}`,
    ) as THREE.Sprite | undefined
    const targetMesh = scene.getObjectByName(
        `${target.key}-${target.userId}`,
    ) as THREE.Sprite | undefined
    if (!sourceMesh || !targetMesh) return

    const pyrus = new THREE.Color(getAttributColor("Pyrus"))
    const core = new THREE.Color(0xfff1a8)
    const mid = pyrus.clone().lerp(new THREE.Color(0xff8a1a), 0.35)
    const tip = pyrus.clone().lerp(new THREE.Color(0x7f1d1d), 0.25)

    const from = sourceMesh.position.clone()
    from.y = 0.12
    const to = targetMesh.position.clone()
    to.y = 0.12

    const tornado = playFlameTornado({
        scene,
        from,
        to,
        colors: { core, mid, tip },
        shape: {
            count: 56,
            height: 2.3,
            spread: 0.5,
            sizeMin: 0.13,
            sizeMax: 0.38,
            stretchY: 1.9,
        },
        formDuration: 0.4,
        travelDuration: 0.8,
        spins: 3,
        holdDuration: 0.12,
        fadeDuration: 0.35,
    })

    try {
        await tornado.done
        await playGrayTrembleHitReaction({
            target: targetMesh,
            grayColor: mid,
            shakeAmount: { x: 0.1, z: 0.08 },
        })
    } finally {
        tornado.dispose()
    }
}
