import type { AnimationDirectivesTypes, portalSlotsTypeElement } from '../../type/type-index.js';


type Props = {
    slot: portalSlotsTypeElement
    animations: AnimationDirectivesTypes[];
}

type RemoveGateCardDirectiveAnimationType = ({ animations, slot }: Props) => void

export const RemoveGateCardDirectiveAnimation: RemoveGateCardDirectiveAnimationType = ({ animations, slot }) => {

    slot.bakugans.forEach((bakugan) => {
        const comeBackBakuganDirective: AnimationDirectivesTypes = {
            type: 'COME_BACK_BAKUGAN',
            data: {
                bakugan: bakugan,
                slot: slot
            },
            resolved: false,
        }

        animations.push(comeBackBakuganDirective)

    })

    const removeGateCard: AnimationDirectivesTypes = {
        type: 'REMOVE_GATE_CARD',
        data: {
            slot: slot
        },
        resolved: false,
    }

    animations.push(removeGateCard)
}