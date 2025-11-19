import type { bakuganOnSlot } from "@bakugan-arena/game-data"

function CreateBakuganPreviewContainer({ bakugan, userId }: { bakugan: bakuganOnSlot, userId: string }) {

    const container = document.createElement('div')

    container.classList.add('bakugan-previews-container')
    container.id = bakugan.userId === userId ? 'left-bakugan-previews-container' : 'right-bakugan-previews-container'

    // Contener des sprites
    let sprites_prewiew_container = document.getElementById(bakugan.userId === userId ? 'left-sprites-preview' : 'right-sprites-preview')
    if (!sprites_prewiew_container) {
        sprites_prewiew_container = document.createElement('div')
        sprites_prewiew_container.id = bakugan.userId === userId ? 'left-sprites-preview' : 'right-sprites-preview'
        sprites_prewiew_container.classList.add('sprites-preview')
    }

    // Sprites
    const sprite_container = document.createElement('div')
    sprite_container.classList.add('sprite-container')
    sprite_container.id = bakugan.userId === userId ? 'left-sprite-container' : 'right-sprite-container'
    const attribut_background = document.createElement('img')
    attribut_background.classList.add('attribut-background')
    attribut_background.src = `/images/attributs-background/${bakugan.attribut.toUpperCase()}.png`

    const sprite = document.createElement('img')
    sprite.classList.add('sprite')
    sprite.src = `/images/bakugans/sphere/${bakugan.image}/${bakugan.attribut.toUpperCase()}.png`

    sprite_container.appendChild(attribut_background)
    sprite_container.appendChild(sprite)

    sprites_prewiew_container.appendChild(sprite_container)

    const power_container = document.createElement('div')
    power_container.classList.add('power-container')

    const attribut_image = document.createElement('div')
    attribut_image.classList.add('attribut-image-container')
    const attribut = document.createElement('img')
    attribut.src = `/images/attributs/${bakugan.attribut.toUpperCase()}.png`
    attribut.classList.add('attribut-image')
    attribut_image.appendChild(attribut)

    const power = document.createElement('p')
    power.id = `${bakugan.userId}-${bakugan.slot_id}`
    power.textContent = bakugan.currentPower.toString()
    power_container.appendChild(attribut_image)
    power_container.appendChild(power)

    container.appendChild(sprites_prewiew_container)
    container.appendChild(power_container)

    return container

}

function CreateSpritePreviewContainer({ bakugan, userId }: { bakugan: bakuganOnSlot, userId: string }) {
    const newContainer = document.createElement('div')

    newContainer.classList.add('bakugan-previews-container')
    newContainer.id = bakugan.userId === userId ? `left-renfor-${bakugan.id}` : `right-renfor-${bakugan.id}`

    const sprites_prewiew_container = document.createElement('div')
    sprites_prewiew_container.id = bakugan.userId === userId ? `left-renfort-preview-${bakugan.id}` : `right-renfort-preview-${bakugan.id}`
    sprites_prewiew_container.classList.add('sprites-preview')


    const sprite_container = document.createElement('div')
    sprite_container.classList.add('sprite-container')
    sprite_container.id = bakugan.userId === userId ? 'left-sprite-container' : 'right-sprite-container'
    const attribut_background = document.createElement('img')
    attribut_background.classList.add('attribut-background')
    attribut_background.src = `/images/attributs-background/${bakugan.attribut.toUpperCase()}.png`

    const sprite = document.createElement('img')
    sprite.classList.add('sprite')
    sprite.src = `/images/bakugans/sphere/${bakugan.image}/${bakugan.attribut.toUpperCase()}.png`

    sprite_container.appendChild(attribut_background)
    sprite_container.appendChild(sprite)

    sprites_prewiew_container.appendChild(sprite_container)

    const power_container = document.createElement('div')
    power_container.classList.add('power-container')

    const attribut_image = document.createElement('div')
    attribut_image.classList.add('attribut-image-container')
    const attribut = document.createElement('img')
    attribut.src = `/images/attributs/${bakugan.attribut.toUpperCase()}.png`
    attribut.classList.add('attribut-image')
    attribut_image.appendChild(attribut)

    const power = document.createElement('p')
    power.id = `${bakugan.key}-${bakugan.userId}`
    power.textContent = bakugan.currentPower.toString()
    power_container.appendChild(attribut_image)
    power_container.appendChild(power)

    newContainer.appendChild(sprites_prewiew_container)
    newContainer.appendChild(power_container)

    return { newContainer, sprite_container }
}


export {
    CreateBakuganPreviewContainer,
    CreateSpritePreviewContainer
}