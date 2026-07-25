import gsap from "gsap"
import * as THREE from "three"
import { getAttributColor } from "../../functions/get-attrubut-color"
import { playWaterDropImpact } from "../effects"
import type { CustomAnimationContext } from "./types"

const BAKUGAN_REST_Y = 0.75
const BAKUGAN_DIVE_Y = 0.08
const BAKUGAN_REST_SCALE = 2

function tween(targets: gsap.TweenTarget, vars: gsap.TweenVars): Promise<void> {
    return new Promise((resolve) => {
        gsap.to(targets, {
            ...vars,
            onComplete: resolve,
        })
    })
}

/**
 * Plongée en Eau Profonde —
 * 1) Shared Aquos water-drop impact (same as Mirage Aquatique)
 * 2) Non-Aquos bakugans are pulled toward the caster and dragged underwater, then restored
 * PowerChange directives play afterward.
 */
export async function PlongeeEnEauProfondeAnimation({
    scene,
    plane,
    data,
}: CustomAnimationContext): Promise<void> {
    const source = data.sourceBakugan
    const victims = data.targetBakugans ?? []
    if (!source) return

    const sourceMesh = scene.getObjectByName(
        `${source.key}-${source.userId}`,
    ) as THREE.Sprite | undefined
    if (!sourceMesh) return

    const aquos = new THREE.Color(getAttributColor("Aquos"))
    const impactWorld = sourceMesh.getWorldPosition(new THREE.Vector3())

    let waterFx: Awaited<ReturnType<typeof playWaterDropImpact>> | null = null

    const victimMeshes = victims
        .map((bakugan) => {
            const mesh = scene.getObjectByName(
                `${bakugan.key}-${bakugan.userId}`,
            ) as THREE.Sprite | undefined
            if (!mesh) return null
            return {
                bakugan,
                mesh,
                home: mesh.position.clone(),
                homeScale: mesh.scale.clone(),
                material: mesh.material as THREE.SpriteMaterial,
                originalOpacity: (mesh.material as THREE.SpriteMaterial).opacity,
            }
        })
        .filter((entry): entry is NonNullable<typeof entry> => entry !== null)

    try {
        waterFx = await playWaterDropImpact({
            scene,
            plane,
            impactWorld,
            color: aquos,
        })

        if (victimMeshes.length === 0) {
            await waterFx.ripplesDone
            return
        }

        const pullTarget = sourceMesh.position.clone()
        pullTarget.y = BAKUGAN_DIVE_Y

        // Pull non-Aquos toward the caster and dive them underwater
        await Promise.all(
            victimMeshes.map(({ mesh, material, home }, index) => {
                const delay = index * 0.06
                const mid = home.clone().lerp(pullTarget, 0.7)
                mid.y = BAKUGAN_DIVE_Y
                return Promise.all([
                    tween(mesh.position, {
                        x: mid.x,
                        y: BAKUGAN_DIVE_Y,
                        z: mid.z,
                        duration: 0.45,
                        delay,
                        ease: "power2.in",
                    }),
                    tween(mesh.scale, {
                        x: BAKUGAN_REST_SCALE * 0.35,
                        y: BAKUGAN_REST_SCALE * 0.18,
                        z: 1,
                        duration: 0.45,
                        delay,
                        ease: "power2.in",
                    }),
                    tween(material, {
                        opacity: 0.2,
                        duration: 0.45,
                        delay,
                        ease: "power2.in",
                    }),
                ])
            }),
        )

        // Hold briefly underwater near the caster
        await Promise.all(
            victimMeshes.map(({ mesh }, index) =>
                tween(mesh.position, {
                    x: pullTarget.x + (index - (victimMeshes.length - 1) / 2) * 0.35,
                    z: pullTarget.z,
                    y: BAKUGAN_DIVE_Y,
                    duration: 0.35,
                    ease: "power1.inOut",
                }),
            ),
        )

        // Surface and return to original positions
        await Promise.all(
            victimMeshes.map(({ mesh, material, home, homeScale }) =>
                Promise.all([
                    tween(mesh.position, {
                        x: home.x,
                        y: BAKUGAN_REST_Y,
                        z: home.z,
                        duration: 0.5,
                        ease: "back.out(1.4)",
                    }),
                    tween(mesh.scale, {
                        x: homeScale.x,
                        y: homeScale.y,
                        z: homeScale.z,
                        duration: 0.45,
                        ease: "back.out(1.3)",
                    }),
                    tween(material, {
                        opacity: 1,
                        duration: 0.35,
                        ease: "power2.out",
                    }),
                ]),
            ),
        )

        await waterFx.ripplesDone
    } finally {
        waterFx?.dispose()

        for (const { mesh, material, home, homeScale, originalOpacity } of victimMeshes) {
            gsap.killTweensOf(mesh.position)
            gsap.killTweensOf(mesh.scale)
            gsap.killTweensOf(material)
            mesh.position.copy(home)
            mesh.scale.copy(homeScale)
            material.opacity = originalOpacity
        }
    }
}
