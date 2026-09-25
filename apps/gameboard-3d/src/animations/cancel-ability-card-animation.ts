import type { attribut } from "@bakugan-arena/game-data";
import * as THREE from "three";
import {
    BAKUGAN_REST_Y,
    createAbilityCardStage,
    tween,
} from "./ability-card/ability-card-stage";

/**
 * Annulation d'une carte capacité, jouée dans la scène 3D.
 *
 * Reprend la présentation de l'activation — la carte monte et s'illumine de son
 * attribut — puis la renverse : la couleur est étouffée, un voile noir avale la
 * carte, qui se casse et tombe. C'est l'inverse exact de l'activation, où la
 * carte est lancée dans le bakugan.
 */
export async function CancelAbilityCardAnimation({
    scene,
    camera,
    card,
    attribut,
    bakugan,
}: {
    scene: THREE.Scene
    camera: THREE.PerspectiveCamera
    card: string
    attribut: attribut
    bakugan?: { key: string; userId: string }
}): Promise<void> {
    const stage = createAbilityCardStage({ scene, camera, card, attribut })
    if (!stage) return

    const { group, cardMesh, tintOverlay } = stage
    const dark = new THREE.Color(0x0b0713)

    // Onde sombre qui se referme sur le bakugan dont la capacité est annulée.
    const targetMesh = bakugan
        ? (scene.getObjectByName(`${bakugan.key}-${bakugan.userId}`) as THREE.Sprite | undefined)
        : undefined

    const collapse = new THREE.Mesh(
        new THREE.SphereGeometry(1, 20, 20),
        new THREE.MeshBasicMaterial({
            color: stage.colors.attribut,
            transparent: true,
            opacity: 0,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
        }),
    )
    if (targetMesh) {
        collapse.position.set(targetMesh.position.x, BAKUGAN_REST_Y, targetMesh.position.z)
        collapse.scale.setScalar(2.2)
        scene.add(collapse)
    }

    try {
        await stage.present()
        await stage.floodWithAttribut()

        // La couleur est étouffée : le voile vire au noir et couvre la carte.
        await Promise.all([
            tween(tintOverlay.material.color, {
                r: dark.r,
                g: dark.g,
                b: dark.b,
                duration: 0.45,
                ease: "power2.in",
            }),
            tween(tintOverlay.material, { opacity: 0.8, duration: 0.45, ease: "power2.in" }),
            tween(cardMesh.material.color, {
                r: 0.25,
                g: 0.25,
                b: 0.3,
                duration: 0.45,
                ease: "power2.in",
            }),
            // Sursaut sec, comme un refus.
            tween(group.rotation, {
                z: group.rotation.z - 0.14,
                duration: 0.12,
                yoyo: true,
                repeat: 3,
                ease: "sine.inOut",
            }),
            // Ce que la carte devait donner est repris au bakugan.
            targetMesh
                ? Promise.all([
                      tween(collapse.material, {
                          opacity: 0.7,
                          duration: 0.2,
                          yoyo: true,
                          repeat: 1,
                          ease: "power2.out",
                      }),
                      tween(collapse.scale, { x: 0.2, y: 0.2, z: 0.2, duration: 0.45, ease: "power2.in" }),
                  ])
                : Promise.resolve(),
        ])

        // La carte se casse et tombe hors du cadre.
        await Promise.all([
            tween(group.rotation, {
                z: group.rotation.z + 0.7,
                x: group.rotation.x + 0.35,
                duration: 0.5,
                ease: "power2.in",
            }),
            tween(group.scale, { x: 0.6, y: 0.6, z: 0.6, duration: 0.5, ease: "power2.in" }),
            tween(group.position, { y: group.position.y - 3.2, duration: 0.5, ease: "power2.in" }),
            tween([cardMesh.material, tintOverlay.material], {
                opacity: 0,
                duration: 0.45,
                delay: 0.05,
                ease: "power1.in",
            }),
        ])
    } finally {
        stage.dispose()
        collapse.removeFromParent()
        collapse.geometry.dispose()
        collapse.material.dispose()
    }
}
