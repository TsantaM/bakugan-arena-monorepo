import type { AnimationDirectivesTypes, attribut, bakuganOnSlot, Message, stateType } from "../../type/type-index.js";

export function ChangeAttributAnimationDirective({roomState, bakugan, attribut,message} : {roomState: stateType, bakugan: bakuganOnSlot, attribut: attribut, message: Message[]}) {

    const directive: AnimationDirectivesTypes = {
        type: 'CHANGE_ATTRIBUT',
        resolve: false,
        data: {
            attribut: attribut,
            bakugan: bakugan
        },
        message: message
    }

    roomState.animations.push(directive)
    
}