import type { attribut } from "@bakugan-arena/game-data";
import gsap from "gsap";
import * as THREE from "three";
import {
    BAKUGAN_REST_Y,
    createAbilityCardStage,
    tween,
} from "./ability-card/ability-card-stage";

/** Échelle finale de la carte quand elle atteint le sprite du bakugan. */
const IMPACT_SCALE = 0.22

type ActiveAbilityCardContext = {
    scene: THREE.Scene
    camera: THREE.PerspectiveCamera
    card: string
    attribut: attribut
    bakugan?: { key: string, userId: string }
}

/** Boule de lumière additive jouée à l'impact sur le bakugan. */
function createFlash(color: THREE.Color): THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial> {
    const material = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
    })
    return new THREE.Mesh(new THREE.SphereGeometry(0.6, 20, 20), material)
}

/**
 * Activation d'une carte capacité, jouée entièrement dans la scène 3D.
 *
 * Étape 1 — la carte monte par le bas et se présente face caméra
 * Étape 2 — toute la carte s'illumine de la couleur de son attribut
 * Étape 3 — elle est lancée vers le bakugan qui l'utilise, en rétrécissant
 *           jusqu'à la taille du sprite
 * Étape 4 — elle éclate dans le bakugan, qui encaisse le flash
 *
 * Les étapes 1 et 2 sont partagées avec l'annulation et l'échec de capacité :
 * les trois se lisent comme la même carte, avec trois issues différentes.
 *
 * Sans bakugan connu (anciens replays, directive sans `bakugan`), l'animation
 * s'arrête après l'étape 2 avec un simple fondu.
 */
export async function ActiveAbilityCardAnimation({
    scene,
    camera,
    card,
    attribut,
    bakugan,
}: ActiveAbilityCardContext): Promise<void> {
    const stage = createAbilityCardStage({ scene, camera, card, attribut })
    if (!stage) return

    const { group, cardMesh, tintOverlay, colors } = stage
    const cardMaterial = cardMesh.material

    // --- La cible et son état d'origine -------------------------------------
    const targetMesh = bakugan
        ? (scene.getObjectByName(`${bakugan.key}-${bakugan.userId}`) as THREE.Sprite | undefined)
        : undefined

    const spriteMaterial = targetMesh?.material as THREE.SpriteMaterial | undefined
    const spriteColor = spriteMaterial?.color.clone()
    const spriteScale = targetMesh?.scale.clone()

    const flash = createFlash(colors.highlight)
    flash.scale.setScalar(0.1)
    if (targetMesh) {
        flash.position.set(targetMesh.position.x, BAKUGAN_REST_Y, targetMesh.position.z)
        scene.add(flash)
    }

    try {
        // === Étapes 1 et 2 : présentation et embrasement ====================
        await stage.present()
        await stage.floodWithAttribut()

        // Directive sans bakugan : on s'arrête ici, la carte se dissipe.
        if (!targetMesh) {
            await Promise.all([
                tween([cardMaterial, tintOverlay.material], {
                    opacity: 0,
                    duration: 0.35,
                    ease: "power1.in",
                }),
                tween(group.scale, { x: 1.15, y: 1.15, z: 1.15, duration: 0.35, ease: "power1.out" }),
            ])
            return
        }

        // === Étape 3 : la carte est lancée vers son utilisateur ==============
        const destination = new THREE.Vector3(
            targetMesh.position.x,
            BAKUGAN_REST_Y,
            targetMesh.position.z,
        )

        await Promise.all([
            // La carte garde une part de couleur pendant le vol : on la lit
            // comme un projectile d'énergie plutôt que comme une image qui glisse.
            tween(tintOverlay.material, { opacity: 0.45, duration: 0.2, ease: "power1.out" }),
            tween(group.position, {
                x: destination.x,
                y: destination.y,
                z: destination.z,
                duration: 0.6,
                ease: "power2.in",
            }),
            tween(group.scale, {
                x: IMPACT_SCALE,
                y: IMPACT_SCALE,
                z: IMPACT_SCALE,
                duration: 0.6,
                ease: "power2.in",
            }),
            // Un tour complet pendant le vol
            tween(group.rotation, {
                y: group.rotation.y + Math.PI * 2,
                duration: 0.6,
                ease: "power1.inOut",
            }),
        ])

        // === Étape 4 : impact sur le bakugan ================================
        await Promise.all([
            tween([cardMaterial, tintOverlay.material], {
                opacity: 0,
                duration: 0.2,
                ease: "power1.in",
            }),
            tween(flash.material, {
                opacity: 0.95,
                duration: 0.15,
                yoyo: true,
                repeat: 1,
                ease: "power2.out",
            }),
            tween(flash.scale, { x: 2.4, y: 2.4, z: 2.4, duration: 0.3, ease: "power2.out" }),
            // Le sprite encaisse : teinte et sursaut d'échelle
            spriteMaterial
                ? tween(spriteMaterial.color, {
                      r: colors.highlight.r,
                      g: colors.highlight.g,
                      b: colors.highlight.b,
                      duration: 0.15,
                      yoyo: true,
                      repeat: 1,
                      ease: "sine.inOut",
                  })
                : Promise.resolve(),
            spriteScale
                ? tween(targetMesh.scale, {
                      x: spriteScale.x * 1.18,
                      y: spriteScale.y * 1.18,
                      duration: 0.15,
                      yoyo: true,
                      repeat: 1,
                      ease: "sine.inOut",
                  })
                : Promise.resolve(),
        ])
    } finally {
        // Le sprite doit toujours retrouver son état d'origine.
        if (spriteMaterial && spriteColor) {
            gsap.killTweensOf(spriteMaterial.color)
            spriteMaterial.color.copy(spriteColor)
        }
        if (targetMesh && spriteScale) {
            gsap.killTweensOf(targetMesh.scale)
            targetMesh.scale.copy(spriteScale)
        }

        gsap.killTweensOf(flash.material)
        gsap.killTweensOf(flash.scale)
        flash.removeFromParent()
        flash.geometry.dispose()
        flash.material.dispose()

        stage.dispose()
    }
}
