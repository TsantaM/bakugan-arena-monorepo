import type { ActionType } from "@bakugan-arena/game-data/src/type/actions-serveur-requests";

export function BuildOpenGateCard({ action, turnActionContainer }: { action: ActionType, turnActionContainer: HTMLDivElement }) {

    if(action.type !== 'OPEN_GATE_CARD') return

    const button = document.createElement('button')
    button.classList.add('open-gate-card-button')
    button.id = 'open-gate-card-button'
    button.textContent = `Open Gate Card (${action.slot})`

    turnActionContainer.appendChild(button)
}