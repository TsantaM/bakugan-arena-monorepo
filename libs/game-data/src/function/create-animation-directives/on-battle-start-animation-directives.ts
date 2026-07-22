import type { AnimationDirectivesTypes, portalSlotsTypeElement, stateType } from '../../type/type-index.js'
import { pushReplayAnimation } from '../replay/push-replay-animation.js'

export function OnBattleStartAnimationDirectives({ animations, slot, turn, roomState } : { slot: portalSlotsTypeElement, animations: AnimationDirectivesTypes[]; turn: number; roomState: stateType}) {
    const animationDirective: AnimationDirectivesTypes = {
        type: 'BATTLE_START',
        data: {
            slot: slot
        },
        resolved: false,
        message: [{
            key: 'battle_start',
            turn: turn
        }]
    }

    animations.push(animationDirective)
    pushReplayAnimation(roomState, animationDirective)
}
