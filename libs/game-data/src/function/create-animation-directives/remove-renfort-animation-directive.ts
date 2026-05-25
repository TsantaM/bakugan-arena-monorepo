import { Bakugans } from "../../battle-brawlers/bakugans.js";
import { AnimationDirectivesTypes } from "../../type/animations-directives.js";
import { bakuganOnSlot } from "../../type/room-types.js";

type Props = {
    bakugan: bakuganOnSlot,
    animations: AnimationDirectivesTypes[];
    animationsForReplay: AnimationDirectivesTypes[];
    turnCount: number
}

export default function RemoveRenfortAnimationDirective({ animations, bakugan, turnCount, animationsForReplay }: Props) {
    const removeRenfortAnimationDirective: AnimationDirectivesTypes = {
        type: 'REMOVE_RENFORT',
        data: {
            bakugan: bakugan
        },
        message: [{
            text: `${Bakugans[bakugan.key].name} leave the battle`,
            turn: turnCount,
            description: false
        }],
        resolve: false
    }

    animations.push(removeRenfortAnimationDirective)
    animationsForReplay.push(removeRenfortAnimationDirective)
}