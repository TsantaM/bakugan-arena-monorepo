import type { AnimationDirectivesTypes } from '../../type/animations-directives';
import type { portalSlotsTypeElement } from '../../type/room-types'

export function OnBattleStartAnimationDirectives({ animations, slot } : { slot: portalSlotsTypeElement, animations: AnimationDirectivesTypes[];}) {
    const animationDirective: AnimationDirectivesTypes = {
        type: 'BATTLE_START',
        data: {
            slot: slot
        },
        resolved: false,
        message: [{
            text: `Début d'un nouveau combat !`
        }]
    }

    animations.push(animationDirective)
}