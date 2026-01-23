import { BakuganList } from '../../battle-brawlers/bakugans.js';
import type { AnimationDirectivesTypes, bakuganOnSlot, portalSlotsTypeElement } from '../../type/type-index.js'


type Props = {
    bakugan: bakuganOnSlot,
    slot: portalSlotsTypeElement
    animations: AnimationDirectivesTypes[];
}

type ElimineBakuganDirectiveAnimationType = ({ animations, bakugan, slot }: Props) => void

export const ElimineBakuganDirectiveAnimation: ElimineBakuganDirectiveAnimationType = ({ animations, bakugan, slot }) => {
    const comeBackBakuganDirective: AnimationDirectivesTypes = {
        type: 'ELIMINE_BAKUGAN',
        data: {
            bakugan: bakugan,
            slot: slot
        },
        resolved: false,
        message: [{
            text: `${BakuganList.find((b) => bakugan.key === b.key )?.name || ''} eliminate`
        }]
    }

    animations.push(comeBackBakuganDirective)
}