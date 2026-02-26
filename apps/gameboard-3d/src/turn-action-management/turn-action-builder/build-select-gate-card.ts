import type { ActionType, SelectableGateCardAction } from "@bakugan-arena/game-data";
import { CreateGateCardSelecter } from "../../functions/create-selecters";

export function BuildSelectGateCard({ action }: { action: ActionType }) {

    if (action.type !== 'SELECT_GATE_CARD') return

        const SelectGateCard: SelectableGateCardAction[] = action.data;

        const selectOne = document.createElement('div');
        selectOne.classList.add('select-one');
        const stackSelecteOne = document.createElement('div');
        stackSelecteOne.id = 'stack-selecte-one';
        stackSelecteOne.classList.add('stack-container');
        selectOne.appendChild(stackSelecteOne);
        document.body.appendChild(selectOne);

        SelectGateCard.forEach((card, index) => {
            CreateGateCardSelecter({
                card: card,
                index: index
            })
        })

}