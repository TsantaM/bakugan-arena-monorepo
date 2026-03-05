import { AnimationDirectivesTypes } from "../../type/animations-directives";
import { bakuganOnSlot } from "../../type/room-types";

type Props = {
    bakugan: bakuganOnSlot,
    animations: AnimationDirectivesTypes[];
}

export default function RemoveRenfortAnimationDirective({ animations, bakugan }: Props) {
    const removeRenfortAnimationDirective: AnimationDirectivesTypes = {
        type: 'REMOVE_RENFORT',
        data: {
            bakugan: bakugan
        },
        message: [],
        resolve: false
    }

    animations.push(removeRenfortAnimationDirective)
}