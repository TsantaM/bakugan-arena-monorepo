import type { ActionType } from "@bakugan-arena/game-data/src/type/actions-serveur-requests";

export function BuildUseAbilityCard({ action, turnActionContainer } : { action: ActionType, turnActionContainer: HTMLDivElement }) {
    if(action.type !== 'USE_ABILITY_CARD') return

}