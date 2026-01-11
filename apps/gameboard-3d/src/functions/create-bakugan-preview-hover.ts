import type { attribut, slots_id } from "@bakugan-arena/game-data";

export type BakuganPreviewData = {
    attribut: attribut,
    bakuganKey: string,
    powerLevel: string,
    image: string,
    userId: string,
    slot: slots_id
}

export function RemoveBakuganHoverPreview() {
    const existing = document.getElementById('bakugan-hover-preview')
    existing?.remove()
}

export function CreateBakuganHoverPreview(
    data: BakuganPreviewData,
    mouse: { x: number; y: number }
) {
    // Supprime un preview existant (sécurité)
    RemoveBakuganHoverPreview()

    const container = document.createElement('div')
    container.id = 'bakugan-hover-preview'
    container.classList.add('bakugan-previews-container-hover')

    // Conversion coordonnées normalisées → pixels
    const px = ((mouse.x + 1) / 2) * window.innerWidth
    const py = ((1 - mouse.y) / 2) * window.innerHeight

    // Décalage visuel (évite d’être sous le curseur)
    container.style.position = 'fixed'
    container.style.left = `${px + 15}px`
    container.style.top = `${py + 15}px`
    container.style.pointerEvents = 'none'
    container.style.zIndex = '9999'

    /* ---------- SPRITES ---------- */

    const sprites_preview_container = document.createElement('div')
    sprites_preview_container.classList.add('sprites-preview')

    const sprite_container = document.createElement('div')
    sprite_container.classList.add('sprite-container')
    sprite_container.setAttribute(
        'data-key',
        `${data.bakuganKey}-${data.userId}-${data.slot}`
    )

    const attribut_background = document.createElement('img')
    attribut_background.classList.add('attribut-background')
    attribut_background.src = `/images/attributs-background/${data.attribut.toUpperCase()}.png`

    const sprite = document.createElement('img')
    sprite.classList.add('sprite')
    sprite.src = `/images/bakugans/sphere/${data.image}/${data.attribut.toUpperCase()}.png`

    sprite_container.appendChild(attribut_background)
    sprite_container.appendChild(sprite)
    sprites_preview_container.appendChild(sprite_container)

    /* ---------- POWER ---------- */

    const power_container = document.createElement('div')
    power_container.classList.add('power-container')

    const attribut_image_container = document.createElement('div')
    attribut_image_container.classList.add('attribut-image-container')

    const attribut_image = document.createElement('img')
    attribut_image.classList.add('attribut-image')
    attribut_image.src = `/images/attributs/${data.attribut.toUpperCase()}.png`

    attribut_image_container.appendChild(attribut_image)

    const power = document.createElement('p')
    power.textContent = data.powerLevel.toString()

    power_container.appendChild(attribut_image_container)
    power_container.appendChild(power)

    /* ---------- ASSEMBLY ---------- */

    container.appendChild(sprites_preview_container)
    container.appendChild(power_container)

    document.body.appendChild(container)
}