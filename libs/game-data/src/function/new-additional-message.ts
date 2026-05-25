import { AnimationDirectivesTypes, Message } from "../type/animations-directives.js";
import { stateType } from "../type/room-types.js";

type NewAdditionnalMessageType = {
    text: string;
    roomState: stateType
}

export function NewAdditionnalMessage({ roomState, text }: NewAdditionnalMessageType) {

    const message: Message = {
        text: text,
        turn: roomState.turnState.turnCount,
        description: false,
    }

    const animation: AnimationDirectivesTypes = {
        type: 'ADDITIONAL_MESSAGE',
        message: [message],
        resolve: false
    }

    roomState.animations.push(animation)
    roomState.animationsForReplay.push(animation)

}