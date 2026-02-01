import type { ActivePlayerActionRequestType, InactivePlayerActionRequestType } from "@bakugan-arena/game-data";
import { BuildSelectGateCard } from "./turn-action-builder/build-select-gate-card";
import { BuildSelectAbilityCard } from "./turn-action-builder/build-select-ability-card";
import { BuildSelectBakugan } from "./turn-action-builder/build-select-bakugan";
import { BuildSetGateCards } from "./turn-action-builder/build-set-gate-cards";
import { BuildSetBakugan } from "./turn-action-builder/build-set-bakugan";
import { BuildUseAbilityCard } from "./turn-action-builder/build-use-ability-card";
import { clearTurnInterface } from "./turn-actions-resolution/action-scope";
import { BuildOpenGateCard } from "./turn-action-builder/build-open-gate-card";

export const TurnActionInterfaceBuilder = ({ request }: { request: ActivePlayerActionRequestType | InactivePlayerActionRequestType }) => {


    if (document.getElementById('stack-selecte-one')) {
        document.getElementById('stack-selecte-one')?.remove()
    }

    if (document.querySelector('.turn-interface')) {
        document.querySelector('.turn-interface')?.remove()
    }

    const actions = [request.actions.mustDo, request.actions.mustDoOne, request.actions.optional].flat();

    if (actions.length === 1 && (actions[0].type === 'SELECT_GATE_CARD' || actions[0].type === 'SELECT_ABILITY_CARD' || actions[0].type === 'SELECT_BAKUGAN')) {
        BuildSelectGateCard({ action: actions[0] })
        BuildSelectAbilityCard({ action: actions[0] })
        BuildSelectBakugan({ action: actions[0] })
    } else {
        clearTurnInterface()

        const turnActionContainer = document.createElement('div')
        turnActionContainer.classList.add('turn-interface')

        const button = document.createElement('button')
        button.id = 'next-turn-button'

        const img = document.createElement('img')
        img.src = 'next-turn-icon.png'
        img.alt = ''
        img.id = 'next-turn-button-icon'

        button.appendChild(img)

        document.body.appendChild(turnActionContainer)
        document.body.appendChild(button)

        if (actions.length === 0) {
            if (request.target === 'INACTIVE_PLAYER') return
            const message = document.createElement('p');
            message.textContent = `You can't do anything ! Just pass your turn`
            turnActionContainer.appendChild(message)
        } else {
            actions.forEach((action) => {
                BuildSetGateCards({ action: action, turnActionContainer: turnActionContainer })
                BuildSetBakugan({ action: action, turnActionContainer: turnActionContainer })
                BuildUseAbilityCard({ action: action, turnActionContainer: turnActionContainer })
                BuildOpenGateCard({ action: action, turnActionContainer: turnActionContainer })
            })
        }


    }

}