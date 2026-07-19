import type { AnimationDirectivesTypes, bakuganOnSlot, Message, slots_id, stateType } from '../../type/type-index.js'
import { pushReplayAnimation } from '../replay/push-replay-animation.js'

type Props = {
    roomState: stateType
    animationKey: string
    sourceBakugan?: bakuganOnSlot
    targetBakugans?: bakuganOnSlot[]
    slotId?: slots_id
    payload?: Record<string, unknown>
    message?: Message[]
}

export function CustomAnimationDirective({
    roomState,
    animationKey,
    sourceBakugan,
    targetBakugans,
    slotId,
    payload,
    message,
}: Props) {
    const directive: AnimationDirectivesTypes = {
        type: 'CUSTOM_ANIMATION',
        data: {
            animationKey,
            sourceBakugan,
            targetBakugans,
            slotId,
            payload,
        },
        message,
        resolved: false,
    }

    roomState.animations.push(directive)
    pushReplayAnimation(roomState, directive)
}
