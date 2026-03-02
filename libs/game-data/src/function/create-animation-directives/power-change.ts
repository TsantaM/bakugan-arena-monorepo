import { BakuganList } from '../../battle-brawlers/bakugans.js';
import type { AnimationDirectivesTypes, bakuganOnSlot } from '../../type/type-index.js';

type Props = {
    bakugans: bakuganOnSlot[];
    powerChange: number;
    malus?: boolean;
    animations: AnimationDirectivesTypes[];
    turn: number
}

type PowerChangeDirectiveAnumationType = ({ bakugans, powerChange, malus, animations, turn }: Props) => void

export const PowerChangeDirectiveAnumation: PowerChangeDirectiveAnumationType = ({ bakugans, powerChange, malus = false, animations, turn }) => {

    const powerChangeDirective: AnimationDirectivesTypes = {
        type: 'POWER_CHANGE',
        data: {
            bakugan: bakugans,
            powerChange: powerChange,
            malus: malus
        },
        resolved: false,
        message: bakugans.map((b) => ({
            text: malus ? `${BakuganList.find((bakugan) => bakugan.key === b.key)?.name || ''} power decreased of ${powerChange} Gs !` : `${BakuganList.find((bakugan) => bakugan.key === b.key)?.name || ''} power increased of ${powerChange} Gs !`,
            turn: turn
        }))
    }

    animations.push(powerChangeDirective)

}