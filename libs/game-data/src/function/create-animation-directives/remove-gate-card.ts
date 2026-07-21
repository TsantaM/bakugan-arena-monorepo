import type { AnimationDirectivesTypes, portalSlotsTypeElement, stateType } from '../../type/type-index.js';
import { pushReplayAnimation } from '../replay/push-replay-animation.js';


type Props = {
    roomState: stateType,
    slot: portalSlotsTypeElement
    animations: AnimationDirectivesTypes[];
}

type RemoveGateCardDirectiveAnimationType = ({ roomState, animations, slot }: Props) => void

export const RemoveGateCardDirectiveAnimation: RemoveGateCardDirectiveAnimationType = ({ roomState, animations, slot }) => {
    // Snapshot so ResetSlot (often called right after) cannot mutate animation payloads
    const slotSnapshot = structuredClone(slot)

    slot.bakugans.forEach((bakugan) => {

        const bakuganInDeck = roomState.decksState.find((d) => d.userId === bakugan.userId)?.bakugans.find((b) => b.bakuganData.key === bakugan.key)

        const comeBackBakuganDirective: AnimationDirectivesTypes = {
            type: 'COME_BACK_BAKUGAN',
            data: {
                bakugan: structuredClone(bakugan),
                slot: slotSnapshot
            },
            resolved: false,
        }

        animations.push(comeBackBakuganDirective)
        pushReplayAnimation(roomState, comeBackBakuganDirective)
        if (bakuganInDeck) bakuganInDeck.bakuganData.onDomain = false


    })

    const removeGateCard: AnimationDirectivesTypes = {
        type: 'REMOVE_GATE_CARD',
        data: {
            slot: slotSnapshot
        },
        resolved: false,
    }

    animations.push(removeGateCard)
    pushReplayAnimation(roomState, removeGateCard)

}
