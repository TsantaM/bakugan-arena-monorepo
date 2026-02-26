import type { ActionType, SelectableAbilityCardAction } from "@bakugan-arena/game-data";
import { CreateGateCardSelecter } from "../../functions/create-selecters";

export function BuildSelectAbilityCard({ action }: { action: ActionType }) {

    if (action.type !== "SELECT_ABILITY_CARD") return

    const Abilities: SelectableAbilityCardAction = action.data.map((data) => data).flat()
    

    const merged = [Abilities].flat()


    const selectOne = document.createElement('div');
    selectOne.classList.add('select-one');
    const stackSelecteOne = document.createElement('div');
    stackSelecteOne.id = 'stack-selecte-one';
    stackSelecteOne.classList.add('stack-container');
    selectOne.appendChild(stackSelecteOne);
    document.body.appendChild(selectOne);

    merged.forEach((bakugan) => {

        bakugan.abilities.forEach((card, index) => {
            CreateGateCardSelecter({
                card: card,
                index: index
            })
        })

    })

}