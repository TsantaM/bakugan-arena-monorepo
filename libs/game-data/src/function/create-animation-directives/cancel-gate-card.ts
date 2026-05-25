import type { AnimationDirectivesTypes, portalSlotsTypeElement } from '../../type/type-index.js'


type Props = {
    slot: portalSlotsTypeElement
    animations: AnimationDirectivesTypes[];
    animationsForReplay: AnimationDirectivesTypes[];
    turn: number
}

type CancelGateCardDirectiveAnimationType = ({ animations, slot, turn, animationsForReplay }: Props) => void

export const CancelGateCardDirectiveAnimation: CancelGateCardDirectiveAnimationType = ({ animations, slot, turn, animationsForReplay }) => {
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
    animationsForReplay.push(comeBackBakuganDirective)
}