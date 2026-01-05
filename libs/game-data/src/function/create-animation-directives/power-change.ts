import { BakuganList } from '../../battle-brawlers/bakugans';
import type { AnimationDirectivesTypes } from '../../type/animations-directives'
import type { bakuganOnSlot } from '../../type/room-types';

type Props = {
    bakugans: bakuganOnSlot[];
    powerChange: number;
    malus?: boolean;
    animations: AnimationDirectivesTypes[];
}

type PowerChangeDirectiveAnumationType = ({ bakugans, powerChange, malus, animations }: Props) => void

export const PowerChangeDirectiveAnumation: PowerChangeDirectiveAnumationType = ({bakugans, powerChange, malus = false, animations}) => {

    const powerChangeDirective: AnimationDirectivesTypes = {
        type: 'POWER_CHANGE',
        data: {
            bakugan: bakugans,
            powerChange: powerChange,
            malus: malus
        },
        resolved: false,
        message: bakugans.map((b) => ({
            text: malus ? `Baisse du niveau de puissance de ${BakuganList.find((bakugan) => bakugan.key === b.key )?.name || ''} de ${powerChange} G !` : `Hausse du niveau de puissance de ${BakuganList.find((bakugan) => bakugan.key === b.key )?.name || ''} de ${powerChange} G !`
        }))
    }

    animations.push(powerChangeDirective)

}