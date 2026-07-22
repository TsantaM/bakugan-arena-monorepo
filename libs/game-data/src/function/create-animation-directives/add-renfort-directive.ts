import { BakuganList, Bakugans } from '../../battle-brawlers/bakugans.js';
import type { AnimationDirectivesTypes, bakuganOnSlot, portalSlotsTypeElement, stateType } from '../../type/type-index.js'
import { pushReplayAnimation } from '../replay/push-replay-animation.js'

type Props = {
    animations: AnimationDirectivesTypes[];
    roomState: stateType;
    bakugan: bakuganOnSlot;
    slot: portalSlotsTypeElement,
    turn: number
}

type AddRenfortAnimationDirectiveType = ({ animations, roomState, bakugan, slot, turn }: Props) => void;

export const SetBakuganAndAddRenfortAnimationDirective: AddRenfortAnimationDirectiveType = ({ animations, roomState, bakugan, slot, turn }) => {
    const animation: AnimationDirectivesTypes = {
        type: 'SET_BAKUGAN_AND_ADD_RENFORT',
        data: {
            bakugan: bakugan,
            slot: slot
        },
        resolved: false,
        message: [{
            key: 'bakugan_join_battle',
            params: { name: BakuganList.find((b) => bakugan.key === b.key)?.name || '' },
            turn: turn
        }]
    }

    if (animations.some((a) => a === animation)) return

    animations.push(animation)
    pushReplayAnimation(roomState, animation)
}

export const AddRenfortAnimationDirective: AddRenfortAnimationDirectiveType = ({ animations, roomState, bakugan, slot, turn }) => {
    const animation: AnimationDirectivesTypes = {
        type: 'ADD_RENFORT',
        data: {
            bakugan: bakugan,
            slot: slot
        },
        resolved: false,
        message: [{
            key: 'bakugan_join_battle',
            params: { name: Bakugans[bakugan.key].name },
            turn: turn
        }]
    }

    if (animations.some((a) => a === animation)) return

    animations.push(animation)
    pushReplayAnimation(roomState, animation)
}
