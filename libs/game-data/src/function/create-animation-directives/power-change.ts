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
    // Snapshot bakugans so later PowerChange mutations don't rewrite currentPower on older directives
    const bakugansSnapshot = structuredClone(bakugans)

    const powerChangeDirective: AnimationDirectivesTypes = {
        type: 'POWER_CHANGE',
        data: {
            bakugan: bakugansSnapshot,
            powerChange: powerChange,
            malus: malus,
            finalPower: finalPower
        },
        resolved: false,
        message: bakugansSnapshot.map((b) => ({
            key: malus ? 'power_decreased' : 'power_increased',
            params: {
                name: BakuganList.find((bakugan) => bakugan.key === b.key)?.name || '',
                amount: powerChange,
            },
            turn: turn
        }))
    }

    animations.push(powerChangeDirective)
    pushReplayAnimation(roomState, powerChangeDirective)
}
