import { AbilityCardsList, ExclusiveAbilitiesList, type attribut } from "@bakugan-arena/game-data";
import gsap from "gsap";
import * as THREE from "three";
import { getAttributColor } from "../functions/get-attrubut-color";

/** Taille de la carte présentée, au ratio des cartes portail (4 × 6). */
const CARD_WIDTH = 2.2
const CARD_HEIGHT = 3.3
/** Distance devant la caméra où la carte est présentée au joueur. */
const PRESENT_DISTANCE = 7
/** Décalage vertical (axe local de la carte) d'où elle monte au début. */
const RISE_OFFSET = 2.5
/** Échelle finale de la carte quand elle atteint le sprite du bakugan. */
const IMPACT_SCALE = 0.22
/** Opacité max du voile coloré : la texture reste devinée sous la couleur. */
const TINT_OPACITY = 0.85
const BAKUGAN_REST_Y = 0.75

type ActiveAbilityCardContext = {
    scene: THREE.Scene
    camera: THREE.PerspectiveCamera
    card: string
    attribut: attribut
    bakugan?: { key: string, userId: string }
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

/** Le plan qui porte l'illustration de la carte. */
function createCardMesh(texture: THREE.Texture): THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial> {
    const material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
        // Pas de test de profondeur : la carte doit rester lisible au-dessus du plateau.
        depthTest: false,
        depthWrite: false,
    })
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(CARD_WIDTH, CARD_HEIGHT), material)
    mesh.renderOrder = 998
    return mesh
}

/**
 * Voile de la couleur de l'attribut, exactement aux dimensions de la carte :
 * c'est toute la texture qui prend la couleur, pas seulement un contour
 * (équivalent 3D de la div `.overlay` de l'ancienne animation).
 */
function createTintOverlay(color: THREE.Color): THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial> {
    const material = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
        depthTest: false,
        depthWrite: false,
    })
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(CARD_WIDTH, CARD_HEIGHT), material)
    // Juste devant l'illustration, dans l'espace local du groupe.
    mesh.position.z = 0.01
    mesh.renderOrder = 999
    return mesh
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

function disposeObject(object: THREE.Object3D) {
    object.traverse((child) => {
        if (!(child instanceof THREE.Mesh)) return
        child.geometry.dispose()
        const material = child.material as THREE.Material | THREE.Material[]
        if (Array.isArray(material)) {
            material.forEach((m) => m.dispose())
        } else if (material) {
            material.dispose()
        }
    })
}

function tween(targets: gsap.TweenTarget, vars: gsap.TweenVars): Promise<void> {
    return new Promise((resolve) => {
        gsap.to(targets, {
            ...vars,
            onComplete: resolve,
        })
    })
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
    const cardData = [AbilityCardsList, ExclusiveAbilitiesList].flat().find((c) => c.key === card)
    if (!cardData) return

    // --- Préparation : couleurs de l'attribut -------------------------------
    const color = new THREE.Color(getAttributColor(attribut))
    const white = new THREE.Color(0xffffff)
    const highlight = color.clone().lerp(white, 0.45)

    // --- Préparation : la carte et son voile coloré, dans un même groupe ----
    const texture = loadCardTexture(cardData.image, attribut)
    const cardMesh = createCardMesh(texture)
    const tintOverlay = createTintOverlay(color)
    const cardMaterial = cardMesh.material
    const group = new THREE.Group()
    group.add(cardMesh, tintOverlay)

    // --- Préparation : placement devant la caméra ---------------------------
    // Le groupe reprend l'orientation de la caméra : la carte est plein cadre
    // quel que soit l'angle de vue du joueur.
    const forward = new THREE.Vector3()
    camera.getWorldDirection(forward)
    const presentPosition = camera.position
        .clone()
        .add(forward.clone().multiplyScalar(PRESENT_DISTANCE))
    group.position.copy(presentPosition)
    group.quaternion.copy(camera.quaternion)
    // Départ plus bas sur l'axe local (la carte étant face caméra, c'est bien
    // « par le bas de l'écran » du point de vue du joueur).
    group.translateY(-RISE_OFFSET)
    group.scale.setScalar(0.85)
    scene.add(group)

    // --- Préparation : la cible et son état d'origine -----------------------
    const targetMesh = bakugan
        ? (scene.getObjectByName(`${bakugan.key}-${bakugan.userId}`) as THREE.Sprite | undefined)
        : undefined

    const spriteMaterial = targetMesh?.material as THREE.SpriteMaterial | undefined
    const spriteColor = spriteMaterial?.color.clone()
    const spriteScale = targetMesh?.scale.clone()

    const flash = createFlash(highlight)
    flash.scale.setScalar(0.1)
    if (targetMesh) {
        flash.position.set(targetMesh.position.x, BAKUGAN_REST_Y, targetMesh.position.z)
        scene.add(flash)
    }

    try {
        // === Étape 1 : la carte monte et se présente ========================
        await Promise.all([
            // Apparition de l'illustration
            tween(cardMaterial, { opacity: 1, duration: 0.3, ease: "power2.out" }),
            // Montée vers la position de présentation
            tween(group.position, {
                x: presentPosition.x,
                y: presentPosition.y,
                z: presentPosition.z,
                duration: 0.55,
                ease: "back.out(1.2)",
            }),
            // Léger rebond d'échelle à l'arrivée
            tween(group.scale, { x: 1, y: 1, z: 1, duration: 0.55, ease: "back.out(1.4)" }),
        ])

        // === Étape 2 : toute la carte s'illumine ============================
        // Le voile couvre l'intégralité de la texture et le matériau de la carte
        // est lui-même teinté : la couleur de l'attribut envahit toute la carte,
        // puis reflue.
        await Promise.all([
            tween(tintOverlay.material, {
                opacity: TINT_OPACITY,
                duration: 0.4,
                yoyo: true,
                repeat: 1,
                ease: "sine.inOut",
            }),
            tween(cardMaterial.color, {
                r: highlight.r,
                g: highlight.g,
                b: highlight.b,
                duration: 0.4,
                yoyo: true,
                repeat: 1,
                ease: "sine.inOut",
            }),
            // Bascule discrète pour que la carte ne reste pas figée
            // tween(group.rotation, {
            //     z: group.rotation.z + 0.08,
            //     duration: 0.4,
            //     yoyo: true,
            //     repeat: 1,
            //     ease: "sine.inOut",
            // }),
        ])

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
            // Trajet jusqu'au sprite, en accélérant
            tween(group.position, {
                x: destination.x,
                y: destination.y,
                z: destination.z,
                duration: 0.6,
                ease: "power2.in",
            }),
            // Rétrécissement jusqu'à la taille du sprite
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
            // La carte disparaît dans le bakugan
            tween([cardMaterial, tintOverlay.material], {
                opacity: 0,
                duration: 0.2,
                ease: "power1.in",
            }),
            // Flash de la couleur de l'attribut
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
                      r: highlight.r,
                      g: highlight.g,
                      b: highlight.b,
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
        // --- Nettoyage : tweens coupés, sprite remis dans son état d'origine,
        // --- meshes retirés de la scène et ressources GPU libérées.
        gsap.killTweensOf(group.position)
        gsap.killTweensOf(group.scale)
        gsap.killTweensOf(group.rotation)
        gsap.killTweensOf(cardMaterial)
        gsap.killTweensOf(cardMaterial.color)
        gsap.killTweensOf(tintOverlay.material)
        gsap.killTweensOf(flash.material)
        gsap.killTweensOf(flash.scale)

        if (targetMesh && spriteMaterial && spriteColor && spriteScale) {
            gsap.killTweensOf(spriteMaterial.color)
            gsap.killTweensOf(targetMesh.scale)
            spriteMaterial.color.copy(spriteColor)
            targetMesh.scale.copy(spriteScale)
        }

        scene.remove(group)
        scene.remove(flash)
        disposeObject(group)
        flash.geometry.dispose()
        flash.material.dispose()
        texture.dispose()
    }
}
