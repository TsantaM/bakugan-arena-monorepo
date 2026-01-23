import type { AnimationDirectivesTypes, bakuganOnSlot, portalSlotsTypeElement } from '../../type/type-index.js';


type Props = {
    bakugan: bakuganOnSlot,
    slot: portalSlotsTypeElement
    animations: AnimationDirectivesTypes[];
}

type SetBakuganDirectiveAnimationType = ({ animations, bakugan, slot }: Props) => void

export const SetBakuganDirectiveAnimation: SetBakuganDirectiveAnimationType = ({ animations, bakugan, slot }) => {
    const comeBackBakuganDirective: AnimationDirectivesTypes = {
        type: 'SET_BAKUGAN',
        data: {
            bakugan: bakugan,
            slot: slot
        },
        resolved: false,
    }

    animations.push(comeBackBakuganDirective)
}