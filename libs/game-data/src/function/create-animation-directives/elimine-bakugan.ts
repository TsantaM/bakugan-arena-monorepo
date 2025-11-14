import type { AnimationDirectivesTypes } from '../../type/animations-directives'
import { bakuganOnSlot, portalSlotsTypeElement } from '../../type/room-types';


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
    }

    animations.push(comeBackBakuganDirective)
}