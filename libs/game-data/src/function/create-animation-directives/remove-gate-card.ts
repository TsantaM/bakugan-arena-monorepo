import type { AnimationDirectivesTypes } from '../../type/animations-directives'
import { bakuganOnSlot, portalSlotsTypeElement } from '../../type/room-types';


type Props = {
    slot: portalSlotsTypeElement
    animations: AnimationDirectivesTypes[];
}

type RemoveGateCardDirectiveAnimationType = ({ animations, slot }: Props) => void

export const RemoveGateCardDirectiveAnimation: RemoveGateCardDirectiveAnimationType = ({ animations, slot }) => {
    const comeBackBakuganDirective: AnimationDirectivesTypes = {
        type: 'REMOVE_GATE_CARD',
        data: {
            slot: slot
        },
        resolved: false,
    }

    animations.push(comeBackBakuganDirective)
}