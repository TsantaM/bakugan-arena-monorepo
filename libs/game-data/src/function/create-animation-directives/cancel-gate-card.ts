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
    // Snapshot figé : évite que onCanceled / mutations live altèrent
    // les checks client avant le rendu de l'animation.
    const comeBackBakuganDirective: AnimationDirectivesTypes = {
        type: 'CANCEL_GATE_CARD',
        data: {
            slot: structuredClone(slot)
        },
        resolved: false,
        message: [{
            text: `Gate Card nullified`,
            turn: turn
        }]
    }

    animations.push(comeBackBakuganDirective)
    pushReplayAnimation(roomState, comeBackBakuganDirective)
}
