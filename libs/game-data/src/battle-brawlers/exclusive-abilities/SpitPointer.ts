import { PowerChange } from "../../function/index.js";
import { exclusiveAbilitiesType } from "../../type/type-index.js";

export const SpitPointer: exclusiveAbilitiesType = {
    key: 'spit-pointer',
    name: 'Spit Pointer',
    maxInDeck: 1,
    description: `During battle on the slot where this card is activated, this card adds 100 Gs to your Bakugan and subtracts 100 Gs from every opponent Bakugan on that slot. Both changes are reversed if this card is nullified.`,
    usable_if_user_not_on_domain: false,
    usable_in_neutral: false,
    onActivate({ roomState, userId, bakuganKey, slot }) {
        if (!roomState) return null
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate) {
            const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)
            const opponents = slotOfGate.bakugans.filter((b) => b.userId !== userId)

            if (user && opponents.length > 0) {

                PowerChange({
                    bakugan: user,
                    G: 100,
                    malus: false,
                    roomState: roomState
                })

                opponents.forEach((opponent) => {
                    PowerChange({
                        bakugan: opponent,
                        G: 100,
                        malus: true,
                        roomState: roomState
                    })
                })

            }
        }

        return null
    },
    onCanceled({ roomState, userId, bakuganKey, slot }) {
        if (!roomState) return null
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate) {
            const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)
            const opponents = slotOfGate.bakugans.filter((b) => b.userId !== userId)

            if (user && opponents.length > 0) {

                PowerChange({
                    bakugan: user,
                    G: 100,
                    malus: true,
                    roomState: roomState
                })

                opponents.forEach((opponent) => {
                    PowerChange({
                        bakugan: opponent,
                        G: 100,
                        malus: false,
                        roomState: roomState
                    })
                })

            }
        }

        return null
    },
}