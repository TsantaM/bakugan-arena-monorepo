import type { AnimationDirectivesTypes, portalSlotsTypeElement } from '../../type/type-index.js'


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
        message: [{
            text: `Gate Card nullified`
        }]
    }

    animations.push(comeBackBakuganDirective)
}