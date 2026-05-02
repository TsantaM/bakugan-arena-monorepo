import { PowerChangeDirectiveAnumation } from "../../function/index.js";
import { Slots } from "../../store/slots.js";
import { exclusiveAbilitiesType } from "../../type/game-data-types.js";

export const SlashZero: exclusiveAbilitiesType = {
    key: 'slash-zero',
    name: 'Slash Zero',
    description: 'Add 50 Gs to the user.',
    maxInDeck: 1,
    usable_if_user_not_on_domain: false,
    usable_in_neutral: false,
    onActivate({ roomState, userId, bakuganKey, slot }) {
        const slotOfGate = roomState.protalSlots[Slots.indexOf(slot)]
        const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)
        if (user) {
            user.currentPower += 50
            PowerChangeDirectiveAnumation({
                animations: roomState?.animations,
                bakugans: [user],
                powerChange: 50,
                malus: false,
                turn: roomState.turnState.turnCount

            })
        }

        return null
    },
    onCanceled({ roomState, userId, bakuganKey, slot }) {
        const slotOfGate = roomState.protalSlots[Slots.indexOf(slot)]
        const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)
        if (user) {
            user.currentPower -= 50
            PowerChangeDirectiveAnumation({
                animations: roomState?.animations,
                bakugans: [user],
                powerChange: 50,
                malus: true,
                turn: roomState.turnState.turnCount

            })
        }

        return null
    },
}