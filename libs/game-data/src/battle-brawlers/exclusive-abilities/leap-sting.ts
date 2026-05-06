import { AbilityCardFailed, PowerChange } from "../../function/index.js";
import { Slots } from "../../store/slots.js";
import { exclusiveAbilitiesType } from "../../type/game-data-types.js";
import { portalSlotsTypeElement } from "../../type/room-types.js";

export const LeapSting: exclusiveAbilitiesType = {
    key: 'leap-sting',
    name: 'Leap Sting',
    description: 'Subtract 100 Gs to all opponent on the field',
    maxInDeck: 1,
    usable_if_user_not_on_domain: false,
    usable_in_neutral: true,
    onActivate({ roomState, userId, bakuganKey, slot }) {

        const animation = AbilityCardFailed({card: LeapSting.name})

        const slots = roomState.protalSlots
        const slotOfGate: portalSlotsTypeElement = slots[Slots.indexOf(slot)]
        const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)
        if (!user) return animation

        const bakugans = slots.map((s) => s.bakugans).flat().filter((b) => b.userId !== userId)
        if(bakugans.length === 0) return animation

        bakugans.forEach((b) => {
            if (b.userId === userId) return
            PowerChange({
                bakugan: b,
                G: 100,
                malus: true,
                roomState: roomState
            })
        })


        return null
    },
    onCanceled({ roomState, userId, bakuganKey, slot }) {
        const slots = roomState.protalSlots
        const slotOfGate: portalSlotsTypeElement = slots[Slots.indexOf(slot)]
        const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)
        if (!user) return null

        const bakugans = slots.map((s) => s.bakugans).flat().filter((b) => b.userId !== userId)
        bakugans.forEach((b) => {
            if (b.userId === userId) return
            PowerChange({
                bakugan: b,
                G: 100,
                malus: false,
                roomState: roomState
            })
        })
    },
    activationConditions({ roomState, userId }) {
        const opponents = roomState.protalSlots.map((b) => b.bakugans).flat().filter((b) => b.userId !== userId)
        if(opponents.length === 0) return false
        return true
    },
    canUse({ roomState, bakugan }) {
        const {battleInProcess, paused, slot} = roomState.battleState

        if(battleInProcess && !paused) {
            if(bakugan.slot_id === slot) return false
        }

        const slotOfUser = roomState.protalSlots[Slots.indexOf(bakugan.slot_id)]
        const opponents = slotOfUser.bakugans.filter((b) => b.userId !== bakugan.userId)
        if(opponents.length > 0) return false

        return true
    },
}