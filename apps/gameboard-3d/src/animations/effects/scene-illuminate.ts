import gsap from "gsap"
import * as THREE from "three"

export type SceneIlluminateOptions = {
    scene: THREE.Scene
    /** Multiplier applied to each light's current intensity (default 2.4). */
    lightMultiplier?: number
    /** Absolute floor for ambient-ish lights after boost. */
    minBoostedIntensity?: number
    /** How much to lift background / floor toward white (0–1). */
    backgroundLift?: number
    /** Tint color blended into the background while bright. */
    tint?: THREE.ColorRepresentation
    riseDuration?: number
    holdDuration?: number
    fadeDuration?: number
}

export type SceneIlluminateHandle = {
    done: Promise<void>
    dispose: () => void
}

function tween(targets: gsap.TweenTarget, vars: gsap.TweenVars): Promise<void> {
    return new Promise((resolve) => {
        gsap.to(targets, {
            ...vars,
            onComplete: resolve,
        })
    })
}

function collectSceneLights(scene: THREE.Scene): THREE.Light[] {
    const lights: THREE.Light[] = []
    scene.traverse((object) => {
        if (object instanceof THREE.Light) lights.push(object)
    })
    return lights
}

/** Large textured floor plane (MeshBasicMaterial — not affected by lights). */
function findBackgroundPlane(scene: THREE.Scene): THREE.Mesh | null {
    let found: THREE.Mesh | null = null
    scene.traverse((object) => {
        if (!(object instanceof THREE.Mesh)) return
        const geometry = object.geometry
        if (!(geometry instanceof THREE.PlaneGeometry)) return
        if (geometry.parameters.width < 100) return
        found = object
    })
    return found
}

/**
 * Boosts global scene brightness (lights + background + floor) then restores.
 * Reusable for Haos / flare-style field illumination.
 */
export function playSceneIlluminate({
    scene,
    lightMultiplier = 2.4,
    minBoostedIntensity = 1.6,
    backgroundLift = 0.55,
    tint,
    riseDuration = 0.55,
    holdDuration = 0.45,
    fadeDuration = 0.55,
}: SceneIlluminateOptions): SceneIlluminateHandle {
    const previousBackground =
        scene.background instanceof THREE.Color
            ? scene.background.clone()
            : new THREE.Color(0x808080)

    const tintColor = new THREE.Color(tint ?? 0xffffff)
    const brightBackground = previousBackground
        .clone()
        .lerp(new THREE.Color(0xffffff), backgroundLift)
        .lerp(tintColor, 0.2)

    const lights = collectSceneLights(scene)
    const previousLightIntensities = lights.map((light) => light.intensity)
    const boostedIntensities = previousLightIntensities.map((intensity) =>
        Math.max(intensity * lightMultiplier, minBoostedIntensity),
    )

    const bgPlane = findBackgroundPlane(scene)
    const bgMaterial =
        bgPlane?.material instanceof THREE.MeshBasicMaterial ? bgPlane.material : null
    const previousBgPlaneColor = bgMaterial?.color.clone() ?? null
    const brightBgPlaneColor = previousBgPlaneColor
        ?.clone()
        .lerp(new THREE.Color(0xffffff), backgroundLift * 0.85)
        .lerp(tintColor, 0.15) ?? null

    const workingBackground = previousBackground.clone()
    scene.background = workingBackground

    const restore = () => {
        scene.background = previousBackground
        lights.forEach((light, index) => {
            light.intensity = previousLightIntensities[index]
        })
        if (bgMaterial && previousBgPlaneColor) {
            bgMaterial.color.copy(previousBgPlaneColor)
        }
    }

    const done = (async () => {
        await Promise.all([
            ...lights.map((light, index) =>
                tween(light, {
                    intensity: boostedIntensities[index],
                    duration: riseDuration,
                    ease: "power2.out",
                }),
            ),
            tween(workingBackground, {
                r: brightBackground.r,
                g: brightBackground.g,
                b: brightBackground.b,
                duration: riseDuration,
                ease: "power2.out",
                onUpdate: () => {
                    scene.background = workingBackground
                },
            }),
            ...(bgMaterial && brightBgPlaneColor
                ? [
                      tween(bgMaterial.color, {
                          r: brightBgPlaneColor.r,
                          g: brightBgPlaneColor.g,
                          b: brightBgPlaneColor.b,
                          duration: riseDuration,
                          ease: "power2.out",
                      }),
                  ]
                : []),
        ])

        await new Promise<void>((resolve) => {
            gsap.delayedCall(holdDuration, resolve)
        })

        await Promise.all([
            ...lights.map((light, index) =>
                tween(light, {
                    intensity: previousLightIntensities[index],
                    duration: fadeDuration,
                    ease: "power2.inOut",
                }),
            ),
            tween(workingBackground, {
                r: previousBackground.r,
                g: previousBackground.g,
                b: previousBackground.b,
                duration: fadeDuration,
                ease: "power2.inOut",
                onUpdate: () => {
                    scene.background = workingBackground
                },
            }),
            ...(bgMaterial && previousBgPlaneColor
                ? [
                      tween(bgMaterial.color, {
                          r: previousBgPlaneColor.r,
                          g: previousBgPlaneColor.g,
                          b: previousBgPlaneColor.b,
                          duration: fadeDuration,
                          ease: "power2.inOut",
                      }),
                  ]
                : []),
        ])

        scene.background = previousBackground
    })()

    const dispose = () => {
        lights.forEach((light) => gsap.killTweensOf(light))
        gsap.killTweensOf(workingBackground)
        if (bgMaterial) gsap.killTweensOf(bgMaterial.color)
        restore()
    }

    return { done, dispose }
}
