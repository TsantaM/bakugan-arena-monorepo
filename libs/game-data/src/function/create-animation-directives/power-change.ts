import { BakuganList } from '../../battle-brawlers/bakugans.js';
import type { AnimationDirectivesTypes, bakuganOnSlot, stateType } from '../../type/type-index.js';
import { pushReplayAnimation } from '../replay/push-replay-animation.js';

type Props = {
    bakugans: bakuganOnSlot[];
    powerChange: number;
    malus?: boolean;
    animations: AnimationDirectivesTypes[];
    roomState: stateType;
    turn: number,
    finalPower?: number
}

type PowerChangeDirectiveAnumationType = ({ bakugans, powerChange, malus, animations, turn, finalPower, roomState }: Props) => void

export const PowerChangeDirectiveAnumation: PowerChangeDirectiveAnumationType = ({ bakugans, powerChange, malus = false, animations, turn, finalPower, roomState }) => {

    const powerChangeDirective: AnimationDirectivesTypes = {
        type: 'POWER_CHANGE',
        data: {
            bakugan: bakugans,
            powerChange: powerChange,
            malus: malus,
            finalPower: finalPower
        },
        resolved: false,
        message: bakugans.map((b) => ({
            text: malus ? `${BakuganList.find((bakugan) => bakugan.key === b.key)?.name || ''} power decreased of ${powerChange} Gs !` : `${BakuganList.find((bakugan) => bakugan.key === b.key)?.name || ''} power increased of ${powerChange} Gs !`,
            turn: turn
        }))
    }

    animations.push(powerChangeDirective)
    pushReplayAnimation(roomState, powerChangeDirective)
}
