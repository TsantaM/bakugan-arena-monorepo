import { BakuganList } from "../../battle-brawlers/bakugans.js";
import type { AnimationDirectivesTypes, bakuganOnSlot, Message, portalSlotsTypeElement } from "../../type/type-index.js";

type Props = {
    initialSlot: portalSlotsTypeElement,
    newSlot: portalSlotsTypeElement,
    bakugan: bakuganOnSlot,
    animations: AnimationDirectivesTypes[];
    turn:number,
    additionalMessages?: Message[]
}

type MoveToAnotherSlotType = ({ animations, bakugan, initialSlot, newSlot, turn }: Props) => void



export const MoveToAnotherSlotDirectiveAnimation: MoveToAnotherSlotType = ({ animations, bakugan, initialSlot, newSlot, turn, additionalMessages }) => {

    const additionnal: Message[] = additionalMessages ? additionalMessages : []

    const messages: Message[] = [{
            text: `${BakuganList.find((b) => bakugan.key === b.key )?.name || ''} move to ${newSlot.id}`,
            turn: turn
        }, ...additionnal]

    const animation: AnimationDirectivesTypes = {
        type: 'MOVE_TO_ANOTHER_SLOT',
        data: {
            bakugan: bakugan,
            initialSlot: initialSlot,
            newSlot: newSlot
        },
        resolved: false,
        message: messages
    }

    animations.push(animation)
}