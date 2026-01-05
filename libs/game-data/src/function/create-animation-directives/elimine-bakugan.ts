import { BakuganList } from '../../battle-brawlers/bakugans';
import type { AnimationDirectivesTypes } from '../../type/animations-directives'
import type { bakuganOnSlot, portalSlotsTypeElement } from '../../type/room-types';


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
            text: `${BakuganList.find((b) => bakugan.key === b.key )?.name || ''} a été éliminé`
        }]
    }

    animations.push(comeBackBakuganDirective)
}