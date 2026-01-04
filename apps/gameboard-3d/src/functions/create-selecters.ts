import type { SelectableBakuganAction, SelectableGateCardAction } from "@bakugan-arena/game-data/src/type/actions-serveur-requests";
import type { AbilityCard } from "../turn-action-management/turn-action-builder/build-use-ability-card";
import type { attribut } from "@bakugan-arena/game-data";

export function CreateGateCardSelecter({ card, index, multiSelect = false }: { card: SelectableGateCardAction, index: number, multiSelect?: boolean }) {

    const cardElement = document.createElement('div');
    cardElement.classList.add('card-selecter');
    cardElement.classList.add('gate-card-selecter');
    cardElement.id = `${card.key}-${index}`
    cardElement.setAttribute('data-key', card.key);

    const cardDescription = document.createElement('div')
    cardDescription.classList.add('card-description');
    const cardTitle = document.createElement('p')
    cardTitle.classList.add('card-title')
    cardTitle.textContent = card.name
    cardDescription.appendChild(cardTitle)
    cardDescription.setAttribute('data-key', card.key)
    document.body.appendChild(cardDescription)

    const cardImage = document.createElement('img');
    cardImage.src = `/images/cards/${card.image}`
    console.log(cardImage.src)
    cardImage.classList.add('gate-card-background');

    cardElement.appendChild(cardImage);

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
    cardElement.classList.add('ability-card-selecter');
    cardElement.id = `${card.key}-${index}`
    cardElement.setAttribute('data-key', card.key);

    const cardDescription = document.createElement('div')
    cardDescription.classList.add('card-description');
    const cardTitle = document.createElement('p')
    cardTitle.classList.add('card-title')
    cardTitle.textContent = card.name
    cardDescription.appendChild(cardTitle)
    cardDescription.setAttribute('data-key', card.key)
    document.body.appendChild(cardDescription)

    const cardImage = document.createElement('img');
    cardImage.src = card.image === '' ? `/images/cards/special_ability_card_${attribut?.toUpperCase()}.jpg` : `/images/cards/${card.image}`;
    cardImage.classList.add('gate-card-background');

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