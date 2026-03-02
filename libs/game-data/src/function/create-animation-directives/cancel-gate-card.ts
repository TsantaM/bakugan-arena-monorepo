import type { AnimationDirectivesTypes, portalSlotsTypeElement } from '../../type/type-index.js'


type Props = {
    slot: portalSlotsTypeElement
    animations: AnimationDirectivesTypes[];
    turn: number
}

type CancelGateCardDirectiveAnimationType = ({ animations, slot, turn }: Props) => void

export const CancelGateCardDirectiveAnimation: CancelGateCardDirectiveAnimationType = ({ animations, slot, turn }) => {
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

    animations.push(comeBackBakuganDirective)
}