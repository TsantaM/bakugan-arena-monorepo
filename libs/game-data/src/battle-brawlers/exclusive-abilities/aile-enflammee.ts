import { PowerChange, PowerChangeDirectiveAnumation } from "../../function/index.js"
import { exclusiveAbilitiesType } from "../../type/game-data-types.js"

export const AileEnflamee: exclusiveAbilitiesType = {
    key: 'aile-enflammee',
    name: 'Wing Burst',
    description: `During battle on the slot where this card is activated, this card adds 50 Gs to your Bakugan and subtracts 50 Gs from every opponent Bakugan on that slot.`,
    maxInDeck: 1,
    usable_in_neutral: false,
    usable_if_user_not_on_domain: false,
    onActivate: ({ roomState, userId, bakuganKey, slot }) => {
        if (!roomState) return null
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate) {
            const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)
            const opponents = slotOfGate.bakugans.filter((b) => b.userId !== user?.userId)
            if (user && opponents) {
                PowerChange({
                    bakugan: user,
                    G: 50,
                    malus: false,
                    roomState: roomState
                })

                opponents.forEach((b) => {
                    PowerChange({
                        bakugan: b,
                        G: 50,
                        malus: true,
                        roomState: roomState
                    })
                })
            }
        }

        return null
    }
}