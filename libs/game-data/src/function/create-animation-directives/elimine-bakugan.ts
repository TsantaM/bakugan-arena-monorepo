import { BakuganList } from '../../battle-brawlers/bakugans.js';
import type { AnimationDirectivesTypes, bakuganOnSlot, portalSlotsTypeElement, stateType } from '../../type/type-index.js'
import { pushReplayAnimation } from '../replay/push-replay-animation.js'


type Props = {
    bakugan: bakuganOnSlot,
    slot: portalSlotsTypeElement
    animations: AnimationDirectivesTypes[];
    roomState: stateType;
    turn: number
}

type ElimineBakuganDirectiveAnimationType = ({ animations, bakugan, slot, turn, roomState }: Props) => void

export const ElimineBakuganDirectiveAnimation: ElimineBakuganDirectiveAnimationType = ({ animations, bakugan, slot, turn, roomState }) => {
    const comeBackBakuganDirective: AnimationDirectivesTypes = {
        type: 'ELIMINE_BAKUGAN',
        data: {
            bakugan: bakugan,
            slot: slot
        },
        resolved: false,
        message: [{
            text: `${BakuganList.find((b) => bakugan.key === b.key )?.name || ''} eliminate`,
            turn: turn
        }]
    }

    animations.push(comeBackBakuganDirective)
    pushReplayAnimation(roomState, comeBackBakuganDirective)
    
}
