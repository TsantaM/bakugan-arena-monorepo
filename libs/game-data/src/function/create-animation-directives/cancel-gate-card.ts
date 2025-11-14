import type { AnimationDirectivesTypes } from '../../type/animations-directives'
import type { bakuganOnSlot, portalSlotsTypeElement } from '../../type/room-types';


type Props = {
    slot: portalSlotsTypeElement
    animations: AnimationDirectivesTypes[];
}

type CancelGateCardDirectiveAnimationType = ({ animations, slot }: Props) => void

export const CancelGateCardDirectiveAnimation: CancelGateCardDirectiveAnimationType = ({ animations, slot }) => {
    const comeBackBakuganDirective: AnimationDirectivesTypes = {
        type: 'CANCEL_GATE_CARD',
        data: {
            slot: slot
        },
        resolved: false,
    }

    animations.push(comeBackBakuganDirective)
}