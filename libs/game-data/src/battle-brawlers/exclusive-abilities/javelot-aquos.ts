import { AbilityCardFailed, CancelGateCardDirectiveAnimation, getJuxtaposablesSlots } from "../../function/index.js"
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

        const selectedSlotId = resolution.data.slot
        const slot = roomData.protalSlots[Slots.indexOf(selectedSlotId)]
        const userSlot = roomData.protalSlots[Slots.indexOf(resolution.slot)]

        if (userSlot.state.open && !userSlot.state.canceled) {
            const gate = GateCardsList.find((card) => card.key === userSlot.portalCard?.key)
            if (gate) {
                CancelGateCardDirectiveAnimation({ animations: roomData.animations, slot: structuredClone(userSlot), turn: roomData.turnState.turnCount })

                if (gate.onCanceled) gate.onCanceled({ roomState: roomData, slot: userSlot.id, userId: resolution.userId, bakuganKey: resolution.bakuganKey })

                roomData.protalSlots[Slots.indexOf(resolution.slot)].state.canceled = true
            }
        }

        const animation: AnimationDirectivesTypes = {
            type: "SWIPE_GATE_CARD",
            data: {
                slot1: structuredClone(slot),
                slot2: structuredClone(userSlot)
            },
            message: [{
                text: 'Gate Cards Swiped',
                turn: roomData.turnState.turnCount
            }],
            resolve: false,
        }

        const slot1Card = structuredClone(slot.portalCard)
        const slot1State = structuredClone(slot.state)
        const userSlotCard = structuredClone(userSlot.portalCard)
        const userSlotState = structuredClone(userSlot.state)

        roomData.protalSlots[Slots.indexOf(selectedSlotId)].portalCard = userSlotCard
        roomData.protalSlots[Slots.indexOf(selectedSlotId)].state = userSlotState
        roomData.protalSlots[Slots.indexOf(resolution.slot)].portalCard = slot1Card
        roomData.protalSlots[Slots.indexOf(resolution.slot)].state = slot1State


        roomData.animations.push(animation)

        const newCard = roomData.protalSlots[Slots.indexOf(resolution.slot)].portalCard?.key
        if(!newCard) return
        const card = GateCards[newCard]
        if(card.autoActivationCheck && card.autoActivationCheck({portalSlot: roomData.protalSlots[Slots.indexOf(resolution.slot)], roomState: roomData})) return

        const newAction: ActionType = {
            type: 'OPEN_GATE_CARD',
            slot: resolution.slot,
            gateId: newCard
        }

        const turn = roomData.turnState.turn

        const userActions = turn === resolution.userId ? roomData.ActivePlayerActionRequest : roomData.InactivePlayerActionRequest
        const actions = [...userActions.actions.mustDo, ...userActions.actions.mustDoOne, ...userActions.actions.optional].flat()

        if(actions.some((action) => action.type === newAction.type)) return
        userActions.actions.optional.push(newAction)

    },
    activationConditions({ roomState }) {
        if (!roomState) return false

        const slots = roomState.protalSlots.filter((slot) => slot.portalCard !== null)
        if (slots.length < 2) return false

        return true
    },
    canUse({ roomState, bakugan }) {

        if (!roomState) return false
        if (bakugan.key !== SiegeAquos.key) return false

        const slot = roomState.protalSlots.find((slot) => slot.id === bakugan.slot_id)
        if (!slot) return false

        const juxtaposablesSlots = getJuxtaposablesSlots({ slot: slot, roomState: roomState })
        if (juxtaposablesSlots.length === 0) return false
        const swipableSlots = juxtaposablesSlots.filter((slot) => slot.portalCard !== null)
        if (swipableSlots.length === 0) return false

        return true

    },
}