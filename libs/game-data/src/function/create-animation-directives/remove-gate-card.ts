import type { AnimationDirectivesTypes, portalSlotsTypeElement, stateType } from '../../type/type-index.js';


type Props = {
    roomState: stateType,
    slot: portalSlotsTypeElement
    animations: AnimationDirectivesTypes[];
    animationsForReplay: AnimationDirectivesTypes[];
}

type RemoveGateCardDirectiveAnimationType = ({ roomState, animations, slot, animationsForReplay }: Props) => void

export const RemoveGateCardDirectiveAnimation: RemoveGateCardDirectiveAnimationType = ({ roomState, animations, slot, animationsForReplay }) => {

    slot.bakugans.forEach((bakugan) => {

        const bakuganInDeck = roomState.decksState.find((d) => d.userId === bakugan.userId)?.bakugans.find((b) => b.bakuganData.key === bakugan.key)

        const comeBackBakuganDirective: AnimationDirectivesTypes = {
            type: 'COME_BACK_BAKUGAN',
            data: {
                bakugan: bakugan,
                slot: slot
            },
            resolved: false,
        }

        animations.push(comeBackBakuganDirective)
        animationsForReplay.push(comeBackBakuganDirective)
        if (bakuganInDeck) bakuganInDeck.bakuganData.onDomain = false


    })

    const removeGateCard: AnimationDirectivesTypes = {
        type: 'REMOVE_GATE_CARD',
        data: {
            slot: slot
        },
        resolved: false,
    }

    animations.push(removeGateCard)
    animationsForReplay.push(removeGateCard)

}