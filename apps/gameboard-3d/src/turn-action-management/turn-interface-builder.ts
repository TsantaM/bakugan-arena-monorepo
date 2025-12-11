import type { ActivePlayerActionRequestType, InactivePlayerActionRequestType } from "@bakugan-arena/game-data/src/type/actions-serveur-requests";
import { BuildSelectGateCard } from "./turn-action-builder/build-select-gate-card";
import { BuildSelectAbilityCard } from "./turn-action-builder/build-select-ability-card";
import { BuildSelectBakugan } from "./turn-action-builder/build-select-bakugan";
import { BuildSetGateCards } from "./turn-action-builder/build-set-gate-cards";
import { BuildSetBakugan } from "./turn-action-builder/build-set-bakugan";
import { BuildUseAbilityCard } from "./turn-action-builder/build-use-ability-card";

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
        if (document.querySelector('.turn-interface')) {
            document.querySelector('.turn-interface')?.remove()
        }

        const turnActionContainer = document.createElement('div')
        turnActionContainer.classList.add('turn-interface')
        document.body.appendChild(turnActionContainer)

        actions.forEach((action) => {
            BuildSetGateCards({ action: action, turnActionContainer: turnActionContainer })
            BuildSetBakugan({ action: action, turnActionContainer: turnActionContainer })
            BuildUseAbilityCard({ action: action, turnActionContainer: turnActionContainer })
        })
    }

}