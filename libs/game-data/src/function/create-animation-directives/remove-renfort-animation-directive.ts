import { Bakugans } from "../../battle-brawlers/bakugans.js";
import { AnimationDirectivesTypes } from "../../type/animations-directives.js";
import { bakuganOnSlot, stateType } from "../../type/room-types.js";
import { pushReplayAnimation } from "../replay/push-replay-animation.js";

type Props = {
    bakugan: bakuganOnSlot,
    animations: AnimationDirectivesTypes[];
    roomState: stateType;
    turnCount: number
}

export default function RemoveRenfortAnimationDirective({ animations, bakugan, turnCount, roomState }: Props) {
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
    pushReplayAnimation(roomState, removeRenfortAnimationDirective)
}
