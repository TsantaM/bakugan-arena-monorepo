import { BakuganList } from "../../battle-brawlers/index.js";
import { AnimationDirectivesTypes, bakuganOnSlot, portalSlotsTypeElement, stateType } from "../../type/type-index.js";
import { pushReplayAnimation } from "../replay/push-replay-animation.js";

type Props = {
    bakugan: bakuganOnSlot,
    user: bakuganOnSlot
    initialSlot: portalSlotsTypeElement
    animations: AnimationDirectivesTypes[];
    roomState: stateType;
    turn: number
}

type DragAndElimineDirectiveAnimationType = ({ animations, bakugan, initialSlot, turn, roomState }: Props) => void

export const DragAndElimineDirectiveAnimation: DragAndElimineDirectiveAnimationType = ({ animations, bakugan, initialSlot, turn, user, roomState }) => {

    const animation: AnimationDirectivesTypes = {
        type: 'DRAG_AND_ELIMINE',
        data: {
            bakugan: bakugan,
            initialSlot: initialSlot,
            cardUser: user
        },
        resolve: false,
        message: [{
            key: 'bakugan_eliminated',
            params: { name: BakuganList.find((b) => bakugan.key === b.key)?.name || 'A bakugan' },
            turn: turn
        }]
    }

    animations.push(animation)
    pushReplayAnimation(roomState, animation)

}
