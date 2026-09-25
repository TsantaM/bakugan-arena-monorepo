import type { attribut } from "@bakugan-arena/game-data"
import gsap from "gsap"
import * as THREE from "three"
import { getAttributColor } from "../../functions/get-attrubut-color"
import { getBattlefieldBackground } from "../../scene/battlefield-background"

export type AttributeEnvironmentShiftOptions = {
    scene: THREE.Scene
    attribut: attribut
    /** Fade-in duration of the new environment. */
    riseDuration?: number
    /** Fade-out duration when released. */
    fadeDuration?: number
    /** Final opacity of the backdrop (0–1). */
    intensity?: number
    /** How much the scene lights are tinted toward the attribute color (0–1). */
    lightTint?: number
    /** Seconds for one full backdrop rotation while the environment holds. */
    rotationPeriod?: number
}

export type AttributeEnvironmentShiftHandle = {
    /** Resolves once the environment is fully in place. */
    settled: Promise<void>
    /** Fades the environment out and restores the previous look. */
    release: () => Promise<void>
    /** Immediate restore (kills tweens, disposes meshes). Safe to call twice. */
    dispose: () => void
}

/** Background image shipped in `public/images/attributs-background`. */
const BACKGROUND_IMAGE: Record<attribut, string> = {
    Pyrus: "PYRUS.png",
    Aquos: "AQUOS.png",
    Darkus: "DARKUS.png",
    Haos: "HAOS.png",
    Subterra: "SUBTERRA.png",
    Ventus: "VENTUS.png",
}

const BACKDROP_RADIUS = 40

function tween(targets: gsap.TweenTarget, vars: gsap.TweenVars): Promise<void> {
    return new Promise((resolve) => {
        gsap.to(targets, { ...vars, onComplete: resolve })
    })
}

function collectSceneLights(scene: THREE.Scene): THREE.Light[] {
    const lights: THREE.Light[] = []
    scene.traverse((object) => {
        if (object instanceof THREE.Light) lights.push(object)
    })
    return lights
}

/**
 * Swaps the arena environment for the one of an attribute: the matching
 * background sphere fades in around the board, the scene background color and
 * the lights are tinted toward the attribute.
 *
 * The environment holds until `release()` is called, so a card animation can
 * play its own effects "inside" the new environment before restoring it.
 */
export function playAttributeEnvironmentShift({
    scene,
    attribut,
    riseDuration = 0.9,
    fadeDuration = 0.7,
    intensity = 1,
    lightTint = 0.35,
    rotationPeriod = 90,
}: AttributeEnvironmentShiftOptions): AttributeEnvironmentShiftHandle {
    const attributColor = new THREE.Color(getAttributColor(attribut))
    // The drifting galaxies step aside while the attribute environment is up.
    const galaxies = getBattlefieldBackground(scene)

    const previousBackground =
        scene.background instanceof THREE.Color ? scene.background.clone() : null
    const workingBackground = previousBackground?.clone() ?? null
    const tintedBackground = previousBackground?.clone().lerp(attributColor, 0.55) ?? null
    if (workingBackground) scene.background = workingBackground

    const lights = collectSceneLights(scene)
    const previousLightColors = lights.map((light) => light.color.clone())

    const texture = new THREE.TextureLoader().load(
        `./../images/attributs-background/${BACKGROUND_IMAGE[attribut]}`,
    )
    texture.colorSpace = THREE.SRGBColorSpace

    const backdrop = new THREE.Mesh(
        new THREE.SphereGeometry(BACKDROP_RADIUS, 48, 32),
        new THREE.MeshBasicMaterial({
            map: texture,
            side: THREE.BackSide,
            transparent: true,
            opacity: 0,
            depthWrite: false,
        }),
    )
    backdrop.renderOrder = -1
    scene.add(backdrop)

    const spin = gsap.to(backdrop.rotation, {
        y: Math.PI * 2,
        duration: rotationPeriod,
        ease: "none",
        repeat: -1,
    })

    let disposed = false

    const restore = () => {
        if (previousBackground) scene.background = previousBackground
        lights.forEach((light, index) => light.color.copy(previousLightColors[index]))
    }

    const dispose = () => {
        if (disposed) return
        disposed = true
        spin.kill()
        gsap.killTweensOf(backdrop.material)
        if (workingBackground) gsap.killTweensOf(workingBackground)
        lights.forEach((light) => gsap.killTweensOf(light.color))
        restore()
        void galaxies?.show(0.3)
        backdrop.removeFromParent()
        backdrop.geometry.dispose()
        backdrop.material.dispose()
        texture.dispose()
    }

    const settled = Promise.all([
        galaxies?.hide(riseDuration) ?? Promise.resolve(),
        tween(backdrop.material, {
            opacity: intensity,
            duration: riseDuration,
            ease: "power2.out",
        }),
        ...(workingBackground && tintedBackground
            ? [
                  tween(workingBackground, {
                      r: tintedBackground.r,
                      g: tintedBackground.g,
                      b: tintedBackground.b,
                      duration: riseDuration,
                      ease: "power2.out",
                      onUpdate: () => {
                          scene.background = workingBackground
                      },
                  }),
              ]
            : []),
        ...lights.map((light, index) => {
            const tinted = previousLightColors[index].clone().lerp(attributColor, lightTint)
            return tween(light.color, {
                r: tinted.r,
                g: tinted.g,
                b: tinted.b,
                duration: riseDuration,
                ease: "power2.out",
            })
        }),
    ]).then(() => undefined)

    const release = async () => {
        if (disposed) return

        await Promise.all([
            galaxies?.show(fadeDuration) ?? Promise.resolve(),
            tween(backdrop.material, {
                opacity: 0,
                duration: fadeDuration,
                ease: "power2.inOut",
            }),
            ...(workingBackground && previousBackground
                ? [
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
                  ]
                : []),
            ...lights.map((light, index) =>
                tween(light.color, {
                    r: previousLightColors[index].r,
                    g: previousLightColors[index].g,
                    b: previousLightColors[index].b,
                    duration: fadeDuration,
                    ease: "power2.inOut",
                }),
            ),
        ])

        dispose()
    }

    return { settled, release, dispose }
}
