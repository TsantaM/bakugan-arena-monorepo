import type { attribut } from "@bakugan-arena/game-data";
import * as THREE from "three";
import { createAbilityCardStage, tween } from "./ability-card/ability-card-stage";

/**
 * Échec d'une carte capacité : ses conditions n'étaient pas réunies.
 *
 * Même présentation que l'activation, mais la carte n'arrive jamais à
 * s'allumer — la couleur de l'attribut monte puis retombe en gris, la carte
 * refuse en tremblant et se retire. Rien n'est lancé vers le bakugan : c'est ce
 * qui la distingue de l'activation, et de l'annulation qui, elle, détruit.
 */
export async function AbilityCardFailedAnimation({
    scene,
    camera,
    card,
    attribut,
}: {
    scene: THREE.Scene
    camera: THREE.PerspectiveCamera
    card: string
    attribut: attribut
}): Promise<void> {
    const stage = createAbilityCardStage({ scene, camera, card, attribut })
    if (!stage) return

    const { group, cardMesh, tintOverlay } = stage
    const gray = new THREE.Color(0x4a4a52)

    try {
        await stage.present()

        // La couleur essaie de monter, et retombe.
        await Promise.all([
            tween(tintOverlay.material, {
                opacity: 0.5,
                duration: 0.25,
                ease: "power2.out",
            }),
            tween(tintOverlay.material.color, {
                r: gray.r,
                g: gray.g,
                b: gray.b,
                duration: 0.45,
                ease: "power2.in",
            }),
            tween(cardMesh.material.color, {
                r: gray.r,
                g: gray.g,
                b: gray.b,
                duration: 0.45,
                ease: "power2.in",
            }),
        ])

        // Refus : deux secousses horizontales, comme une tête qui dit non.
        await tween(group.position, {
            x: group.position.x + 0.22,
            duration: 0.07,
            yoyo: true,
            repeat: 5,
            ease: "sine.inOut",
        })

        // Puis la carte se retire sans rien produire.
        await Promise.all([
            tween(group.position, { y: group.position.y - 1.6, duration: 0.4, ease: "power2.in" }),
            tween(group.scale, { x: 0.8, y: 0.8, z: 0.8, duration: 0.4, ease: "power2.in" }),
            tween([cardMesh.material, tintOverlay.material], {
                opacity: 0,
                duration: 0.4,
                ease: "power1.in",
            }),
        ])
    } finally {
        stage.dispose()
    }
}
