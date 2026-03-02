import { BakuganList } from '../../battle-brawlers/bakugans.js';
import type { AnimationDirectivesTypes, bakuganOnSlot, portalSlotsTypeElement } from '../../type/type-index.js'


type Props = {
    bakugan: bakuganOnSlot,
    slot: portalSlotsTypeElement
    animations: AnimationDirectivesTypes[];
    turn: number
}

type ElimineBakuganDirectiveAnimationType = ({ animations, bakugan, slot, turn }: Props) => void

export const ElimineBakuganDirectiveAnimation: ElimineBakuganDirectiveAnimationType = ({ animations, bakugan, slot, turn }) => {
    const comeBackBakuganDirective: AnimationDirectivesTypes = {
        type: 'ELIMINE_BAKUGAN',
        data: {
            bakugan: bakugan,
            slot: slot
        },
        resolved: false,
        message: [{
            text: `${BakuganList.find((b) => bakugan.key === b.key )?.name || ''} eliminate`,
            turn: turn
        }]
    }

    animations.push(comeBackBakuganDirective)
}