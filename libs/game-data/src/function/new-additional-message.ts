import { AnimationDirectivesTypes, Message } from "../type/animations-directives.js";
import { pushReplayAnimation } from "./replay/push-replay-animation.js";
import { stateType } from "../type/room-types.js";

type NewAdditionnalMessageType = {
    roomState: stateType
    text?: string
    key?: string
    params?: Record<string, string | number>
}

export function NewAdditionnalMessage({ roomState, text, key, params }: NewAdditionnalMessageType) {

    const message: Message = {
        text,
        key,
        params,
        turn: roomState.turnState.turnCount,
        description: false,
    }

    const animation: AnimationDirectivesTypes = {
        type: 'ADDITIONAL_MESSAGE',
        message: [message],
        resolve: false
    }

    roomState.animations.push(animation)
    pushReplayAnimation(roomState, animation)

}
