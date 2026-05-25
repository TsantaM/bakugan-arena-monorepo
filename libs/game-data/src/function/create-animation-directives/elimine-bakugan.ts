import { BakuganList } from '../../battle-brawlers/bakugans.js';
import type { AnimationDirectivesTypes, bakuganOnSlot, portalSlotsTypeElement } from '../../type/type-index.js'


type Props = {
    bakugan: bakuganOnSlot,
    slot: portalSlotsTypeElement
    animations: AnimationDirectivesTypes[];
    animationsForReplay: AnimationDirectivesTypes[];
    turn: number
}

type ElimineBakuganDirectiveAnimationType = ({ animations, bakugan, slot, turn, animationsForReplay }: Props) => void

export const ElimineBakuganDirectiveAnimation: ElimineBakuganDirectiveAnimationType = ({ animations, bakugan, slot, turn, animationsForReplay }) => {
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
    animationsForReplay.push(comeBackBakuganDirective)
    
}