import type { ActionType } from "@bakugan-arena/game-data";
import { CreateGateCardSelecter } from "../../functions/create-selecters";

export function BuildSetGateCards({ action, turnActionContainer }: { action: ActionType, turnActionContainer: HTMLDivElement }) {
    if (action.type !== 'SET_GATE_CARD_ACTION') return
    const cards = action.data.cards
    if (!cards) return

    const container = document.createElement('div')
    container.classList.add('stack-container')
    container.classList.add('gate-cards')
    container.id = 'gate-cards'
    turnActionContainer.appendChild(container)

    cards.forEach((card, index) => {
        CreateGateCardSelecter({
            card: card,
            index: index,
            multiSelect: true
        })
    })

}