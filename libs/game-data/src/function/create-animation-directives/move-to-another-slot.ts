import { BakuganList } from "../../battle-brawlers/bakugans.js";
import type { AnimationDirectivesTypes, bakuganOnSlot, Message, portalSlotsTypeElement, stateType } from "../../type/type-index.js";
import { pushReplayAnimation } from "../replay/push-replay-animation.js";

type Props = {
    initialSlot: portalSlotsTypeElement,
    newSlot: portalSlotsTypeElement,
    bakugan: bakuganOnSlot,
    animations: AnimationDirectivesTypes[];
    roomState: stateType;
    turn:number,
    additionalMessages?: Message[]
}

type MoveToAnotherSlotType = ({ animations, bakugan, initialSlot, newSlot, turn, roomState }: Props) => void



export const MoveToAnotherSlotDirectiveAnimation: MoveToAnotherSlotType = ({ animations, bakugan, initialSlot, newSlot, turn, additionalMessages, roomState }) => {

    const additionnal: Message[] = additionalMessages ? additionalMessages : []

    const messages: Message[] = [{
            key: 'bakugan_move_to_slot',
            params: {
                name: BakuganList.find((b) => bakugan.key === b.key )?.name || '',
                slot: newSlot.id,
            },
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
    pushReplayAnimation(roomState, animation)
    
}
