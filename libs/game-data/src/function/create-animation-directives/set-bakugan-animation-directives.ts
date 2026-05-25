import type { AnimationDirectivesTypes, bakuganOnSlot, portalSlotsTypeElement } from '../../type/type-index.js';


type Props = {
    bakugan: bakuganOnSlot,
    slot: portalSlotsTypeElement
    animations: AnimationDirectivesTypes[];
    animationsForReplay: AnimationDirectivesTypes[];
}

type SetBakuganDirectiveAnimationType = ({ animations, bakugan, slot, animationsForReplay }: Props) => void

export const SetBakuganDirectiveAnimation: SetBakuganDirectiveAnimationType = ({ animations, bakugan, slot, animationsForReplay }) => {
    const comeBackBakuganDirective: AnimationDirectivesTypes = {
        type: 'SET_BAKUGAN',
        data: {
            bakugan: bakugan,
            slot: slot
        },
        resolved: false,
    }

    animations.push(comeBackBakuganDirective)
    animationsForReplay.push(comeBackBakuganDirective)
}