import type { ActionType, SelectableBakuganAction } from "@bakugan-arena/game-data/src/type/actions-serveur-requests";
import { CreateBakuganSelecter } from "../../functions/create-selecters";
import type { bakuganInDeck } from "@bakugan-arena/game-data/src/type/room-types";

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

export function BuildBakuganSelecterCards({ bakugans }: { bakugans: bakuganInDeck[] }) {

    const selectOne = document.createElement('div');
    selectOne.classList.add('select-one');
    const stackSelecteOne = document.createElement('div');
    stackSelecteOne.id = 'bakugan-selecter';
    stackSelecteOne.classList.add('bakugan-selecter');
    selectOne.appendChild(stackSelecteOne);
    document.body.appendChild(selectOne);

    const selectables: SelectableBakuganAction[] = bakugans.map((b) => b?.bakuganData).filter((b) => b !== undefined).map((b) => ({
        attribut: b.attribut,
        currentPower: b.currentPowerLevel,
        image: b.image,
        key: b.key,
        name: b.name
    }))

    selectables.forEach((bakugan, index) => {
        CreateBakuganSelecter({
            bakugan: bakugan,
            index: index
        })
    })

}