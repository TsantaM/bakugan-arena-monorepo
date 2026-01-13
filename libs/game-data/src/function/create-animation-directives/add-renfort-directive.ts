import { BakuganList } from '../../battle-brawlers/bakugans';
import type { AnimationDirectivesTypes } from '../../type/animations-directives'
import type { bakuganOnSlot, portalSlotsTypeElement } from '../../type/room-types';

type Props = {
    animations: AnimationDirectivesTypes[];
    bakugan: bakuganOnSlot;
    slot: portalSlotsTypeElement
}

type AddRenfortAnimationDirectiveType = ({ animations, bakugan, slot }: Props) => void;

export const SetBakuganAndAddRenfortAnimationDirective: AddRenfortAnimationDirectiveType = ({ animations, bakugan, slot }) => {
    const animation: AnimationDirectivesTypes = {
        type: 'SET_BAKUGAN_AND_ADD_RENFORT',
        data: {
            bakugan: bakugan,
            slot: slot
        },
        resolved: false,
        message: [{
            text: `${BakuganList.find((b) => bakugan.key === b.key)?.name || ''} join the battle !`
        }]
    }

    if (animations.some((a) => a === animation)) return

    animations.push(animation)
}

export const AddRenfortAnimationDirective: AddRenfortAnimationDirectiveType = ({ animations, bakugan, slot }) => {
    const animation: AnimationDirectivesTypes = {
        type: 'ADD_RENFORT',
        data: {
            bakugan: bakugan,
            slot: slot
        },
        resolved: false,
        message: [{
            text: `${BakuganList.find((b) => bakugan.key === b.key)?.name || ''} join the battle !`
        }]
    }

    if (animations.some((a) => a === animation)) return

    animations.push(animation)
}