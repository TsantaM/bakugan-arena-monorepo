import { AbilityCardsList, ExclusiveAbilitiesList, type attribut } from "@bakugan-arena/game-data"
import gsap from "gsap"
import * as THREE from "three"
import { getAttributColor } from "../../functions/get-attrubut-color"

/** Taille de la carte présentée, au ratio des cartes portail (4 × 6). */
export const CARD_WIDTH = 2.2
export const CARD_HEIGHT = 3.3
/** Distance devant la caméra où la carte est présentée au joueur. */
export const PRESENT_DISTANCE = 7
/** Décalage vertical (axe local de la carte) d'où elle monte au début. */
const RISE_OFFSET = 2.5
/** Opacité max du voile coloré : la texture reste devinée sous la couleur. */
const TINT_OPACITY = 0.85
/** Hauteur à laquelle un bakugan est visé. */
export const BAKUGAN_REST_Y = 0.75

export type AbilityCardStage = {
    group: THREE.Group
    cardMesh: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>
    tintOverlay: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>
    colors: { attribut: THREE.Color; highlight: THREE.Color }
    /** La carte monte par le bas et se présente face caméra. */
    present: () => Promise<void>
    /** La couleur de l'attribut envahit toute la carte, puis reflue. */
    floodWithAttribut: () => Promise<void>
    dispose: () => void
}

export function tween(targets: gsap.TweenTarget, vars: gsap.TweenVars): Promise<void> {
    return new Promise((resolve) => {
        gsap.to(targets, { ...vars, onComplete: resolve })
    })
}

/**
 * Charge la texture de la carte, avec la même chaîne de repli que l'ancienne
 * version DOM : image de la carte → carte générique de l'attribut → Darkus.
 */
function loadCardTexture(image: string | undefined, attribut: attribut): THREE.Texture {
    const loader = new THREE.TextureLoader()
    const fallbackAttribut = `./../images/cards/ability_card_${attribut.toUpperCase()}.jpg`
    const fallbackGeneric = `./../images/cards/ability_card_DARKUS.jpg`

    const texture = loader.load(
        image ? `./../images/cards/${image}` : fallbackAttribut,
        undefined,
        undefined,
        () => {
            loader.load(fallbackAttribut, (fallback) => {
                texture.image = fallback.image
                texture.needsUpdate = true
            }, undefined, () => {
                loader.load(fallbackGeneric, (fallback) => {
                    texture.image = fallback.image
                    texture.needsUpdate = true
                })
            })
        },
    )

    texture.colorSpace = THREE.SRGBColorSpace
    return texture
}

function createPlane(
    material: THREE.MeshBasicMaterial,
): THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial> {
    return new THREE.Mesh(new THREE.PlaneGeometry(CARD_WIDTH, CARD_HEIGHT), material)
}

/**
 * Mise en scène commune aux trois animations de carte capacité — activation,
 * annulation, échec : la carte est présentée face caméra, prête à recevoir la
 * suite propre à chaque cas.
 *
 * Renvoie `null` quand la carte est inconnue.
 */
export function createAbilityCardStage({
    scene,
    camera,
    card,
    attribut,
}: {
    scene: THREE.Scene
    camera: THREE.PerspectiveCamera
    card: string
    attribut: attribut
}): AbilityCardStage | null {
    const cardData = [AbilityCardsList, ExclusiveAbilitiesList].flat().find((c) => c.key === card)
    if (!cardData) return null

    const color = new THREE.Color(getAttributColor(attribut))
    const highlight = color.clone().lerp(new THREE.Color(0xffffff), 0.45)

    const texture = loadCardTexture(cardData.image, attribut)
    const cardMesh = createPlane(
        new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            opacity: 0,
            side: THREE.DoubleSide,
            // Pas de test de profondeur : la carte reste lisible au-dessus du plateau.
            depthTest: false,
            depthWrite: false,
        }),
    )
    cardMesh.renderOrder = 998

    // Voile de la couleur de l'attribut, exactement aux dimensions de la carte.
    const tintOverlay = createPlane(
        new THREE.MeshBasicMaterial({
            color,
            transparent: true,
            opacity: 0,
            side: THREE.DoubleSide,
            depthTest: false,
            depthWrite: false,
        }),
    )
    tintOverlay.position.z = 0.01
    tintOverlay.renderOrder = 999

    const group = new THREE.Group()
    group.add(cardMesh, tintOverlay)

    // Le groupe reprend l'orientation de la caméra : la carte est plein cadre
    // quel que soit l'angle de vue du joueur.
    const forward = new THREE.Vector3()
    camera.getWorldDirection(forward)
    const presentPosition = camera.position
        .clone()
        .add(forward.clone().multiplyScalar(PRESENT_DISTANCE))
    group.position.copy(presentPosition)
    group.quaternion.copy(camera.quaternion)
    group.translateY(-RISE_OFFSET)
    group.scale.setScalar(0.85)
    scene.add(group)

    return {
        group,
        cardMesh,
        tintOverlay,
        colors: { attribut: color, highlight },
        present: async () => {
            await Promise.all([
                tween(cardMesh.material, { opacity: 1, duration: 0.3, ease: "power2.out" }),
                tween(group.position, {
                    x: presentPosition.x,
                    y: presentPosition.y,
                    z: presentPosition.z,
                    duration: 0.55,
                    ease: "back.out(1.2)",
                }),
                tween(group.scale, { x: 1, y: 1, z: 1, duration: 0.55, ease: "back.out(1.4)" }),
            ])
        },
        floodWithAttribut: async () => {
            await Promise.all([
                tween(tintOverlay.material, {
                    opacity: TINT_OPACITY,
                    duration: 0.4,
                    yoyo: true,
                    repeat: 1,
                    ease: "sine.inOut",
                }),
                tween(cardMesh.material.color, {
                    r: highlight.r,
                    g: highlight.g,
                    b: highlight.b,
                    duration: 0.4,
                    yoyo: true,
                    repeat: 1,
                    ease: "sine.inOut",
                }),
                // Légère bascule pour que la carte ne reste pas figée.
                tween(group.rotation, {
                    z: group.rotation.z + 0.06,
                    duration: 0.4,
                    yoyo: true,
                    repeat: 1,
                    ease: "sine.inOut",
                }),
            ])
        },
        dispose: () => {
            gsap.killTweensOf(group.position)
            gsap.killTweensOf(group.scale)
            gsap.killTweensOf(group.rotation)
            gsap.killTweensOf(cardMesh.material)
            gsap.killTweensOf(cardMesh.material.color)
            gsap.killTweensOf(tintOverlay.material)
            gsap.killTweensOf(tintOverlay.material.color)

            group.removeFromParent()
            cardMesh.geometry.dispose()
            cardMesh.material.dispose()
            tintOverlay.geometry.dispose()
            tintOverlay.material.dispose()
            texture.dispose()
        },
    }
}
