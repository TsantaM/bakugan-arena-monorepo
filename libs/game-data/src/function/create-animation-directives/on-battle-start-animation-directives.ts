import type { AnimationDirectivesTypes, portalSlotsTypeElement } from '../../type/type-index.js'

export function OnBattleStartAnimationDirectives({ animations, slot } : { slot: portalSlotsTypeElement, animations: AnimationDirectivesTypes[];}) {
    const animationDirective: AnimationDirectivesTypes = {
        type: 'BATTLE_START',
        data: {
            slot: slot
        },
        resolved: false,
        message: [{
            text: `New Battle Start !`
        }]
    }

    animations.push(animationDirective)
}