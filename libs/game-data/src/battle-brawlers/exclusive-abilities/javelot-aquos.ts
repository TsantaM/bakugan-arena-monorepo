import { AbilityCardFailed, CancelGateCardDirectiveAnimation, getJuxtaposablesSlots, SwipeGateCardEffect } from "../../function/index.js"
import { Slots } from "../../store/slots.js"
import { AbilityCardsActions, ActionType } from "../../type/actions-serveur-requests.js"
import { AnimationDirectivesTypes } from "../../type/animations-directives.js"
import { exclusiveAbilitiesType } from "../../type/game-data-types.js"
import { SiegeAquos } from "../bakugans/siege.js"
import { GateCards, GateCardsList } from "../gate-gards.js"

export const JavelotAquos: exclusiveAbilitiesType = {
    key: 'javelot-aquos',
    name: 'Aquos Javelin',
    maxInDeck: 1,
    description: `Cancel Gate card and Switches Gate Card with the one next to it`,
    usable_in_neutral: false,
    usable_if_user_not_on_domain: false,
    onActivate: ({ roomState, userId, slot }) => {
        const animation = AbilityCardFailed({ card: JavelotAquos.name })

        if (!roomState) return animation
        if (JavelotAquos.activationConditions && !JavelotAquos.activationConditions({ roomState, userId })) return animation

        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (!slotOfGate) return animation

        const swipableSlots = getJuxtaposablesSlots({ slot: slotOfGate, roomState: roomState }).filter((slot) => slot.portalCard !== null)

        if (swipableSlots.length < 1) return animation
        const slotsIds = swipableSlots.map((slot) => slot.id)

        const request: AbilityCardsActions = {
            type: 'SELECT_SLOT',
            message: 'Aquos Javelin : Select a slot',
            slots: slotsIds
        }

        return request

    },
    onAdditionalEffect({ resolution, roomData }) {
        if (!roomData) return;
        if (resolution.data.type !== "SELECT_SLOT") return;

        SwipeGateCardEffect({
            bakuganKey: resolution.bakuganKey,
            roomData: roomData,
            selectedSlotId: resolution.data.slot,
            userId: resolution.userId,
            userSlotId: resolution.slot,
        })

    },
    activationConditions({ roomState }) {
        if (!roomState) return false
        const { battleInProcess, paused } = roomState.battleState
        if (!battleInProcess || paused) return false
        const slots = roomState.protalSlots.filter((slot) => slot.portalCard !== null)
        if (slots.length < 2) return false

        return true
    },
    canUse({ roomState, bakugan }) {

        if (!roomState) return false
        const { battleInProcess, paused } = roomState.battleState
        if (!battleInProcess || paused) return false
        if (bakugan.key !== SiegeAquos.key) return false

        const slot = roomState.protalSlots.find((slot) => slot.id === bakugan.slot_id)
        if (!slot) return false
        if (slot.id !== roomState.battleState.slot) return false
        const juxtaposablesSlots = getJuxtaposablesSlots({ slot: slot, roomState: roomState })
        if (juxtaposablesSlots.length === 0) return false
        const swipableSlots = juxtaposablesSlots.filter((slot) => slot.portalCard !== null)
        if (swipableSlots.length === 0) return false

        return true

    },
}