import type { SelectableBakuganAction, SelectableGateCardAction } from "@bakugan-arena/game-data";
import type { AbilityCard } from "../turn-action-management/turn-action-builder/build-use-ability-card";
import type { attribut } from "@bakugan-arena/game-data";
import { setImageWithFallback } from "./set-image-with-fallback";

export function CreateGateCardSelecter({ card, index, multiSelect = false }: { card: SelectableGateCardAction, index: number, multiSelect?: boolean }) {

    const cardElement = document.createElement('div');
    cardElement.classList.add('card-selecter', 'gate-card-selecter');
    cardElement.style.transform = `translateX(${index * 50}%)`;
    cardElement.id = `${card.key}-${index}`;
    cardElement.setAttribute('data-key', card.key);

    // Description container
    const cardDescription = document.createElement('div');
    cardDescription.classList.add(
        'card-description',
        'px-5', 'py-4',
        'w-[65vw]', 'lg:w-[25vw]',
        'min-h-[25vh]', 'max-h-[35vh]',
        'rounded-lg', 'bg-neutral-800',
        'flex', 'flex-col', 'gap-2',
        'fixed', 'top-[35%]', 'left-[50%]'
    );
    cardDescription.setAttribute('data-key', card.key);

    // Title
    const cardTitle = document.createElement('p');
    cardTitle.classList.add('font-bold', 'text-slate-200', 'text-xl');
    cardTitle.textContent = card.name;

    // Image
    const cardImage = document.createElement('img');
    cardImage.src = `/images/cards/${card.image}`;
    cardImage.classList.add('gate-card-background');

    // Text description
    const cardText = document.createElement('p');
    cardText.classList.add('text-slate-200');
    cardText.textContent = card.description; // Place ton texte (ex: lorem ipsum)

    // Assemble
    cardDescription.appendChild(cardTitle);
    cardDescription.appendChild(cardText);

    // Final structure
    cardElement.appendChild(cardDescription);
    cardElement.appendChild(cardImage);

    // Ajout au DOM
    document.body.appendChild(cardElement);

    if (multiSelect) {
        const stackContainer = document.getElementById('gate-cards')
        if (!stackContainer) return
        stackContainer.appendChild(cardElement);
    } else {
        const stackContainer = document.getElementById('stack-selecte-one')
        if (!stackContainer) return
        stackContainer.appendChild(cardElement);
    }

}

export function CreateAbilityCardSelecter({ card, index, multiSelect = false, attribut }: { card: AbilityCard, index: number, multiSelect?: boolean, attribut: attribut | undefined }) {
    const cardElement = document.createElement('div');
    cardElement.classList.add('card-selecter');
    cardElement.style.transform = `translateX(${index * 50}%)`;
    cardElement.classList.add('ability-card-selecter');
    cardElement.id = `${card.key}-${index}`
    cardElement.setAttribute('data-key', card.key);

    const cardDescription = document.createElement('div')
    cardDescription.classList.add(
        'card-description',
        'px-5', 'py-4',
        'w-[65vw]', 'lg:w-[25vw]',
        'min-h-[25vh]', 'max-h-[35vh]',
        'rounded-lg', 'bg-neutral-800',
        'flex', 'flex-col', 'gap-2',
        'fixed', 'top-[35%]', 'left-[50%]'
    );
    const cardTitle = document.createElement('p')
    cardTitle.classList.add('card-title')
    cardTitle.textContent = card.name
    cardTitle.classList.add('font-bold', 'text-slate-200', 'text-xl');

    // Text description
    const cardText = document.createElement('p');
    cardText.classList.add('text-slate-200');
    cardText.textContent = card.description; // Place ton texte (ex: lorem ipsum)

    cardDescription.appendChild(cardTitle)
    cardDescription.appendChild(cardText)
    cardDescription.setAttribute('data-key', card.key)
    cardElement.appendChild(cardDescription)

    const cardImage = document.createElement('img');
    // cardImage.src = card.image === '' ? `/images/cards/special_ability_card_${attribut?.toUpperCase()}.jpg` : `/images/cards/${card.image}`;
    cardImage.classList.add('gate-card-background');

    setImageWithFallback(cardImage, `/images/cards/${card.image}`, `/images/cards/ability_card_${attribut ? attribut.toUpperCase() : "DARKUS"}.jpg`, 'ability_card.jpg')


    cardElement.appendChild(cardImage);

    if (multiSelect) {
        const stackContainer = document.getElementById('ability-cards')
        if (!stackContainer) return
        stackContainer.appendChild(cardElement);
    } else {
        const stackContainer = document.getElementById('stack-selecte-one')
        if (!stackContainer) return
        stackContainer.appendChild(cardElement);
    }
}

export function CreateBakuganSelecter({ bakugan, index }: { bakugan: SelectableBakuganAction, index: number }) {
    const bakuganElement = document.createElement('div');
    bakuganElement.classList.add('image-bakugan-selecter-container');
    bakuganElement.setAttribute('data-key', bakugan.key);
    bakuganElement.id = `${bakugan.key}-${index}`;

    const bakuganImage = document.createElement('img');
    bakuganImage.src = `/images/bakugans/sphere/${bakugan.image}/${bakugan.attribut.toUpperCase()}.png`;
    bakuganImage.classList.add('bakugan-image-selecter');
    bakuganElement.appendChild(bakuganImage);

    const bakuganData = document.createElement('p');
    bakuganData.classList.add('bakugan-data');
    bakuganData.textContent = `${bakugan.name} (${bakugan.currentPower})`;
    bakuganElement.appendChild(bakuganData);

    const stackContainer = document.getElementById('bakugan-selecter')
    if (!stackContainer) return
    stackContainer.appendChild(bakuganElement);
}