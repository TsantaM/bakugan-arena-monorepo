import type { ActionType, SelectableBakuganAction } from "@bakugan-arena/game-data/src/type/actions-serveur-requests";
import { CreateBakuganSelecter } from "../../functions/create-selecters";

export function BuildSelectBakugan({ action }: { action: ActionType }) {
    if (action.type !== 'SELECT_BAKUGAN') return

        const bakugans: SelectableBakuganAction[] = action.data;

        const selectOne = document.createElement('div');
        selectOne.classList.add('select-one');
        const stackSelecteOne = document.createElement('div');
        stackSelecteOne.id = 'bakugan-selecter';
        stackSelecteOne.classList.add('bakugan-selecter');
        selectOne.appendChild(stackSelecteOne);
        document.body.appendChild(selectOne);

        bakugans.forEach((bakugan, index) => {

            CreateBakuganSelecter({
                bakugan: bakugan,
                index: index
            })


        })
    
}