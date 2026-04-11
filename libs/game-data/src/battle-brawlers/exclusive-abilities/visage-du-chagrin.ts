import { exclusiveAbilitiesType } from "../../type/game-data-types.js"

export const VisageDuChagrin: exclusiveAbilitiesType = {
    key: 'visage-du-chagrin',
    name: 'Face of Grief',
    description: `Prevents the opponent from activationg abilities`,
    maxInDeck: 1,
    usable_in_neutral: false,
    usable_if_user_not_on_domain: false,
    onActivate: ({ roomState, userId, bakuganKey, slot }) => {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate) {
            const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)
            const opponents = slotOfGate.bakugans.filter((b) => b.userId !== userId)
            if (user) {
                opponents.forEach(opponent => {
                    opponent.abilityBlock = true
                })
            }
        }
        return null
    }
}