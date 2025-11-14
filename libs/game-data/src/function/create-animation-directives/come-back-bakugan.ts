import type { AnimationDirectivesTypes } from '../../type/animations-directives'
import type { bakuganOnSlot, portalSlotsTypeElement } from '../../type/room-types';


type Props = {
    bakugan: bakuganOnSlot,
    slot: portalSlotsTypeElement
    animations: AnimationDirectivesTypes[];
}

type ComeBackBakuganDirectiveAnimationType = ({ animations, bakugan, slot }: Props) => void

export const ComeBackBakuganDirectiveAnimation: ComeBackBakuganDirectiveAnimationType = ({ animations, bakugan, slot }) => {
    const comeBackBakuganDirective: AnimationDirectivesTypes = {
        type: 'COME_BACK_BAKUGAN',
        data: {
            bakugan: bakugan,
            slot: slot
        },
        resolved: false,
    }

    animations.push(comeBackBakuganDirective)
}