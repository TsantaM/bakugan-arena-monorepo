import { PowerChange, PowerChangeDirectiveAnumation } from "../../function/index.js";
import { Slots } from "../../store/slots.js";
import { exclusiveAbilitiesType } from "../../type/game-data-types.js";

export const SlashZero: exclusiveAbilitiesType = {
    key: 'slash-zero',
    name: 'Slash Zero',
    description: `During battle on the slot where this card is activated, this card adds 50 Gs to your Bakugan. The bonus is reversed if this card is nullified.`,
    maxInDeck: 1,
    usable_if_user_not_on_domain: false,
    usable_in_neutral: false,
    onActivate({ roomState, userId, bakuganKey, slot }) {
        const slotOfGate = roomState.protalSlots[Slots.indexOf(slot)]
        const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)
        if (user) {
            PowerChange({
                bakugan: user,
                G: 50,
                malus: false,
                roomState: roomState
            })
        }

        return null
    },
    onCanceled({ roomState, userId, bakuganKey, slot }) {
        const slotOfGate = roomState.protalSlots[Slots.indexOf(slot)]
        const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)
        if (user) {
            PowerChange({
                bakugan: user,
                G: 50,
                malus: true,
                roomState: roomState
            })
        }

        return null
    },
}