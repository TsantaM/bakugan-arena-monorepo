import { CancelAbilityCard } from "../../function/cancel-ability-card.js"
import { exclusiveAbilitiesType } from "../../type/game-data-types.js"

export const DimmensionQuatre: exclusiveAbilitiesType = {
    key: 'dimmension-quatre',
    name: 'Dimmension Quatre',
    description: `Annule toutes les carte maitrises de l'adversaire`,
    maxInDeck: 1,
    usable_in_neutral: false,
    usable_if_user_not_on_domain: false,
    onActivate: ({ roomState, userId, bakuganKey, slot }) => {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate) {
            const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)
            const abilities = slotOfGate.activateAbilities.filter((a) => a.userId !== userId)
            if (user) {
                abilities.forEach((a) => {
                    CancelAbilityCard({ abilityKey: a.key, bakuganKey: a.bakuganKey, roomState: roomState, slot: slot, userId: userId })
                })
            }
        }

        return null
    }
}
