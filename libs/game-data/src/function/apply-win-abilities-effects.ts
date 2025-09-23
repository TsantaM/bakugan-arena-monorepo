import { portalSlotsTypeElement, stateType } from "../type/room-types";
import { ExclusiveAbilitiesList } from "../battle-brawlers/exclusive-abilities";
import { AbilityCardsList } from "../battle-brawlers/ability-cards";

export function applyWinAbilitiesEffects({ slot, winner, roomData }: {
    slot: portalSlotsTypeElement, winner: string, roomData: stateType
}) {
    slot.activateAbilities.filter((a) => !a.canceled && a.userId === winner).forEach((a) => {
        const ability = AbilityCardsList.find((c) => c.key === a.key)
        const exclusive = ExclusiveAbilitiesList.find((c) => c.key === a.key)

        if (ability && ability.onWin) {
            ability.onWin({ userId: winner, roomState: roomData, slot: slot })
        }

        if (exclusive && exclusive.onWin) {
            exclusive.onWin({ userId: winner, roomState: roomData, slot: slot })
        }
    })
}