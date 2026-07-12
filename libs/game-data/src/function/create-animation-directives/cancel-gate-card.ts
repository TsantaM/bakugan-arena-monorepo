import type { AnimationDirectivesTypes, portalSlotsTypeElement, stateType } from '../../type/type-index.js'
import { pushReplayAnimation } from '../replay/push-replay-animation.js'


type Props = {
    slot: portalSlotsTypeElement
    animations: AnimationDirectivesTypes[];
    roomState: stateType;
    turn: number
}

type CancelGateCardDirectiveAnimationType = ({ animations, slot, turn, roomState }: Props) => void

export const CancelGateCardDirectiveAnimation: CancelGateCardDirectiveAnimationType = ({ animations, slot, turn, roomState }) => {
    const comeBackBakuganDirective: AnimationDirectivesTypes = {
        type: 'CANCEL_GATE_CARD',
        data: {
            slot: slot
        },
        resolved: false,
        message: [{
            text: `Gate Card nullified`,
            turn: turn
        }]
    }

    console.log('slot canceled : ', slot.id, slot.portalCard?.key, slot.state)

    animations.push(comeBackBakuganDirective)
    pushReplayAnimation(roomState, comeBackBakuganDirective)
}
