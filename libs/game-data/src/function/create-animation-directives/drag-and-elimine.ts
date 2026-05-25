import { BakuganList } from "../../battle-brawlers/index.js";
import { AnimationDirectivesTypes } from "../../type/type-index.js";
import { bakuganOnSlot, portalSlotsTypeElement } from "../../type/type-index.js";

type Props = {
    bakugan: bakuganOnSlot,
    user: bakuganOnSlot
    initialSlot: portalSlotsTypeElement
    animations: AnimationDirectivesTypes[];
    animationsForReplay: AnimationDirectivesTypes[];
    turn: number
}

type DragAndElimineDirectiveAnimationType = ({ animations, bakugan, initialSlot, turn, animationsForReplay }: Props) => void

export const DragAndElimineDirectiveAnimation: DragAndElimineDirectiveAnimationType = ({ animations, bakugan, initialSlot, turn, user, animationsForReplay }) => {

    const name = BakuganList.find((b) => bakugan.key === b.key)?.name || 'A bakugan'

    const animation: AnimationDirectivesTypes = {
        type: 'DRAG_AND_ELIMINE',
        data: {
            bakugan: bakugan,
            initialSlot: initialSlot,
            cardUser: user
        },
        resolve: false,
        message: [{
            text: `${BakuganList.find((b) => bakugan.key === b.key)?.name || 'A bakugan'} is elimined`,
            turn: turn
        }]
    }

    animations.push(animation)
    animationsForReplay.push(animation)

}
