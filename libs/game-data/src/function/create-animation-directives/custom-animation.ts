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

/** Animation key namespace for gate cards (avoids collisions with ability card keys). */
export const GATE_ANIMATION_PREFIX = 'gate:'

/** Builds the animation key a gate card custom animation is registered under. */
export function gateAnimationKey(gateKey: string) {
    return `${GATE_ANIMATION_PREFIX}${gateKey}`
}

type GateProps = Omit<Props, 'animationKey'> & { gateKey: string }

/**
 * Same as `CustomAnimationDirective`, for a gate card.
 * The 3D animation must be registered in
 * `apps/gameboard-3d/src/animations/custom-animations/gate-cards/registry.ts`
 * under `gate:<gateKey>`. Missing keys are no-ops on the client.
 */
export function GateCustomAnimationDirective({ gateKey, ...rest }: GateProps) {
    CustomAnimationDirective({
        ...rest,
        animationKey: gateAnimationKey(gateKey),
    })
}
