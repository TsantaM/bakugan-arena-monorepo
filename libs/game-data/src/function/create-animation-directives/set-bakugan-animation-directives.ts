import type { AnimationDirectivesTypes, bakuganOnSlot, portalSlotsTypeElement, stateType } from '../../type/type-index.js';
import { pushReplayAnimation } from '../replay/push-replay-animation.js';


type Props = {
    bakugan: bakuganOnSlot,
    slot: portalSlotsTypeElement
    animations: AnimationDirectivesTypes[];
    roomState: stateType;
}

type SetBakuganDirectiveAnimationType = ({ animations, bakugan, slot, roomState }: Props) => void

export const SetBakuganDirectiveAnimation: SetBakuganDirectiveAnimationType = ({ animations, bakugan, slot, roomState }) => {
    const comeBackBakuganDirective: AnimationDirectivesTypes = {
        type: 'SET_BAKUGAN',
        data: {
            bakugan: bakugan,
            slot: slot
        },
        resolved: false,
    }

    animations.push(comeBackBakuganDirective)
    pushReplayAnimation(roomState, comeBackBakuganDirective)
}
