import type { AnimationDirectivesTypes, portalSlotsTypeElement } from '../../type/type-index.js'

export function OnBattleStartAnimationDirectives({ animations, slot, turn } : { slot: portalSlotsTypeElement, animations: AnimationDirectivesTypes[]; turn: number}) {
    const animationDirective: AnimationDirectivesTypes = {
        type: 'BATTLE_START',
        data: {
            slot: slot
        },
        resolved: false,
        message: [{
            text: `New Battle Start !`,
            turn: turn
        }]
    }

    animations.push(animationDirective)
}