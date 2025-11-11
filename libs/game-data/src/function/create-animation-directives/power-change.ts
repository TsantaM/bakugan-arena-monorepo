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
    }

    animations.push(powerChangeDirective)

}