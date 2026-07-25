import gsap from "gsap"
import * as THREE from "three"
import { getAttributColor } from "../../functions/get-attrubut-color"
import { playFlameParticleBurst } from "../effects"
import type { CustomAnimationContext } from "./types"

/**
 * Mur de Feu — a vertical wall of Pyrus flame particles rises in front of the caster
 * before POWER_CHANGE / protection directives play.
 */
export async function MurDeFeuAnimation({
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
    const core = new THREE.Color(0xfff1a8)
    const mid = pyrus.clone().lerp(new THREE.Color(0xff8a1a), 0.35)
    const tip = pyrus.clone().lerp(new THREE.Color(0x7f1d1d), 0.25)

    const sourcePos = sourceMesh.position.clone()
    const opponents = data.targetBakugans ?? []

    // Place the wall slightly in front of the caster, toward the first opponent if any
    let forward = new THREE.Vector3(0, 0, sourcePos.z >= 0 ? -1 : 1)
    if (opponents.length > 0) {
        const opponentMesh = scene.getObjectByName(
            `${opponents[0].key}-${opponents[0].userId}`,
        )
        if (opponentMesh) {
            forward = opponentMesh.position.clone().sub(sourcePos)
            forward.y = 0
            if (forward.lengthSq() > 0.0001) {
                forward.normalize()
            } else {
                forward.set(0, 0, sourcePos.z >= 0 ? -1 : 1)
            }
        }
    }

    const wallPos = sourcePos.clone().addScaledVector(forward, 0.85)
    wallPos.y = 0.1

    // Orient the wall group so local X spans across the forward direction
    const right = new THREE.Vector3().crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize()
    const basis = new THREE.Matrix4().makeBasis(right, new THREE.Vector3(0, 1, 0), forward)

    const flame = playFlameParticleBurst({
        scene,
        position: wallPos,
        colors: { core, mid, tip },
        shape: {
            formation: "wall",
            wallWidth: 2.6,
            wallDepth: 0.28,
            height: 2.4,
            count: 64,
            sizeMin: 0.16,
            sizeMax: 0.45,
            stretchY: 2.1,
        },
        expandDuration: 0.55,
        holdDuration: 0.35,
        fadeDuration: 0.45,
    })

    flame.group.setRotationFromMatrix(basis)

    try {
        // Brief caster heat tint while the wall rises
        const material = sourceMesh.material as THREE.SpriteMaterial
        const originalColor = material.color.clone()
        const homeScale = sourceMesh.scale.clone()

        await Promise.all([
            new Promise<void>((resolve) => {
                gsap.to(material.color, {
                    r: mid.r,
                    g: mid.g,
                    b: mid.b,
                    duration: 0.35,
                    yoyo: true,
                    repeat: 1,
                    ease: "power1.inOut",
                    onComplete: resolve,
                })
            }),
            new Promise<void>((resolve) => {
                gsap.to(sourceMesh.scale, {
                    x: homeScale.x * 1.12,
                    y: homeScale.y * 1.12,
                    duration: 0.35,
                    yoyo: true,
                    repeat: 1,
                    ease: "sine.inOut",
                    onComplete: resolve,
                })
            }),
            flame.done,
        ])

        material.color.copy(originalColor)
        sourceMesh.scale.copy(homeScale)
    } finally {
        flame.dispose()
    }
}
