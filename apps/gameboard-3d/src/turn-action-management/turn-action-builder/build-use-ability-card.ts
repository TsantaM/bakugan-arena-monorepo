import type { ActionType } from "@bakugan-arena/game-data/src/type/actions-serveur-requests";
import { CreateAbilityCardSelecter } from "../../functions/create-selecters";

export type AbilityCard = {
    key: string;
    name: string;
    description: string;
    image: string;
}

export function BuildUseAbilityCard({ action, turnActionContainer }: { action: ActionType, turnActionContainer: HTMLDivElement }) {
    if (action.type !== 'USE_ABILITY_CARD') return
    const cards = [
        ...new Map(
            action.data
                .flatMap(b => b.abilities)
                .map(card => [card.key, card])
        ).values()
    ]

    if (!cards) return

    const container = document.createElement('div')
    container.classList.add('stack-container')
    container.classList.add('ability-cards')
    container.id = 'ability-cards'
    turnActionContainer.appendChild(container)

    cards.forEach((card, index) => {
        const attribut = action.data.find((bakugan) => bakugan.abilities.some((c) => c === card))?.attribut

        CreateAbilityCardSelecter({
            card: card,
            index: index,
            multiSelect: true,
            attribut: attribut
        })
    })

}