import { PowerChangeDirectiveAnumation } from "../../function/index.js";
import { Slots } from "../../store/slots.js";
import { exclusiveAbilitiesType } from "../../type/game-data-types.js";
import { portalSlotsTypeElement } from "../../type/room-types.js";

export const LifeDrew: exclusiveAbilitiesType = {
    key: 'life-drew',
    name: 'Life Drew',
    description: `Add 50 Gs to all allied Bakugans on the field.`,
    maxInDeck: 1,
    usable_if_user_not_on_domain: false,
    usable_in_neutral: true,
    onActivate({ roomState, userId, bakuganKey, slot }) {

        const slots = roomState.protalSlots
        const slotOfGate: portalSlotsTypeElement = slots[Slots.indexOf(slot)]
        const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)
        if (!user) return null

        const bakugans = slots.map((s) => s.bakugans).flat().filter((b) => b.userId === userId)
        bakugans.forEach((b) => {
            if (b.userId !== userId) return
            b.currentPower += 50
            PowerChangeDirectiveAnumation({
                animations: roomState.animations,
                bakugans: [b],
                powerChange: 50,
                malus: false,
                turn: roomState.turnState.turnCount

            })
        })


        return null
    },
    onCanceled({ roomState, userId, bakuganKey, slot }) {
        const slots = roomState.protalSlots
        const slotOfGate: portalSlotsTypeElement = slots[Slots.indexOf(slot)]
        const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)
        if (!user) return null

        const bakugans = slots.map((s) => s.bakugans).flat().filter((b) => b.userId === userId)
        bakugans.forEach((b) => {
            if (b.userId !== userId) return
            b.currentPower -= 50
            PowerChangeDirectiveAnumation({
                animations: roomState.animations,
                bakugans: [b],
                powerChange: 50,
                malus: true,
                turn: roomState.turnState.turnCount

            })
        })
    },
}