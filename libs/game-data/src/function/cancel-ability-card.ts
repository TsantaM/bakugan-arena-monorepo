import { slots_id, stateType } from "../type/room-types";
import { AbilityCardsList } from "../battle-brawlers/ability-cards";
import { ExclusiveAbilitiesList } from "../battle-brawlers/exclusive-abilities";

export const CancelAbilityCard = ({ abilityKey, roomState, userId, bakuganKey, slot}: { roomState: stateType, userId: string, bakuganKey: string, slot: slots_id, abilityKey: string }) => {
    const ability = AbilityCardsList.find((a) => a.key === abilityKey)
    const exclusive = ExclusiveAbilitiesList.find((e) => e.key === abilityKey)
    const slotState = roomState?.protalSlots.find((s) => s.id === slot)
    const abilityToCancel = slotState?.activateAbilities.find((a) => a.key === abilityKey)
    if (abilityToCancel) {
        if (ability) {
            if (ability.onCanceled) {
                ability.onCanceled({ roomState: roomState, userId: userId, bakuganKey: bakuganKey, slot: slot })
            }

        }

        if (exclusive) {
            if (exclusive.onCanceled) {
                exclusive.onCanceled({ roomState: roomState, userId: userId, bakuganKey: bakuganKey, slot: slot})
            }

        }

        abilityToCancel.canceled = true

    }
}