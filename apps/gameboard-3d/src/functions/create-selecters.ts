import type { SelectableBakuganAction, SelectableGateCardAction } from "@bakugan-arena/game-data";
import type { AbilityCard } from "../turn-action-management/turn-action-builder/build-use-ability-card";
import type { attribut } from "@bakugan-arena/game-data";
import { setImageWithFallback } from "./set-image-with-fallback";
import tippy from 'tippy.js'
import 'tippy.js/dist/tippy.css'

export function CreateGateCardSelecter({
    card,
    index,
    multiSelect = false
}: {
    card: SelectableGateCardAction,
    index: number,
    multiSelect?: boolean
}) {

    const cardElement = document.createElement('div')
    cardElement.classList.add('card-selecter', 'gate-card-selecter')
    cardElement.id = `${card.key}-${index}`
    cardElement.setAttribute('data-key', card.key)

    // Image
    const cardImage = document.createElement('img')
    cardImage.src = `/images/cards/${card.image}`
    cardImage.classList.add('gate-card-background')

    cardElement.appendChild(cardImage)

    // 🔥 Tooltip content (HTML)

    const tooltipContent = `<strong class='text-lg' >${card.name}</strong><br/>${card.description}`

    // ✅ Tippy attaché à la carte
    tippy(cardElement, {
        content: tooltipContent,
        placement: 'top',
        allowHTML: true
    })

    // Ajout au DOM
    if (multiSelect) {
        const stackContainer = document.getElementById('gate-cards')
        if (!stackContainer) return
        stackContainer.appendChild(cardElement)
    } else {
        const stackContainer = document.getElementById('stack-selecte-one')
        if (!stackContainer) return
        stackContainer.appendChild(cardElement)
    }
}

export function CreateAbilityCardSelecter({
    card,
    index,
    multiSelect = false,
    attribut
}: {
    card: AbilityCard,
    index: number,
    multiSelect?: boolean,
    attribut: attribut | undefined
}) {

    const cardElement = document.createElement('div')
    cardElement.classList.add('card-selecter', 'ability-card-selecter')
    cardElement.id = `${card.key}-${index}`
    cardElement.setAttribute('data-key', card.key)

    // Image
    const cardImage = document.createElement('img')
    cardImage.classList.add('gate-card-background')

    setImageWithFallback(
        cardImage,
        `/images/cards/${card.image}`,
        `/images/cards/ability_card_${attribut ? attribut.toUpperCase() : "DARKUS"}.jpg`,
        'ability_card.jpg'
    )

    cardElement.appendChild(cardImage)

    // 🔥 Tooltip content
    const tooltipContent = `<strong class='text-lg'>${card.name}</strong><br/>${card.description}`

    // ✅ Tippy attaché
    tippy(cardElement, {
        content: tooltipContent,
        placement: 'top',
        allowHTML: true
    })

    // Ajout au DOM
    if (multiSelect) {
        const stackContainer = document.getElementById('ability-cards')
        if (!stackContainer) return
        stackContainer.appendChild(cardElement)
    } else {
        const stackContainer = document.getElementById('stack-selecte-one')
        if (!stackContainer) return
        stackContainer.appendChild(cardElement)
    }
}

export function CreateBakuganSelecter({
    bakugan,
    index
}: {
    bakugan: SelectableBakuganAction,
    index: number
}) {

    const bakuganElement = document.createElement('div')
    bakuganElement.classList.add('image-bakugan-selecter-container')
    bakuganElement.setAttribute('data-key', bakugan.key)
    bakuganElement.id = `${bakugan.key}-${index}`

    const bakuganImage = document.createElement('img')
    bakuganImage.src = `/images/bakugans/sphere/${bakugan.image}/${bakugan.attribut.toUpperCase()}.png`
    bakuganImage.classList.add('bakugan-image-selecter')

    bakuganElement.appendChild(bakuganImage)

    // 🔥 Tooltip content
    const tooltipContent = `
        <strong class="text-lg">${bakugan.name}</strong><br/>
        Power: ${bakugan.currentPower}
    `

    // ✅ Tippy attaché
    tippy(bakuganElement, {
        content: tooltipContent,
        allowHTML: true,
        placement: 'top',
        // mobile safe
        trigger: 'mouseenter focus',
    })

    const stackContainer = document.getElementById('bakugan-selecter')
    if (!stackContainer) return
    stackContainer.appendChild(bakuganElement)
}