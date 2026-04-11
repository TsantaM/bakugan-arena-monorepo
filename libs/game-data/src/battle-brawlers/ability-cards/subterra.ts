import { AbilityCardFailed, AddRenfortAnimationDirective, CancelGateCardDirectiveAnimation, CheckBattle, dragBakuganToUserSlot, getJuxtaposablesSlots, MoveToAnotherSlotDirectiveAnimation, OpenGateCardActionRequest, PowerChangeDirectiveAnumation } from "../../function/index.js";
import { Slots, StandardCardsImages } from "../../store/store-index.js";
import type { AbilityCardsActions, abilityCardsType, ActionType, AnimationDirectivesTypes, bakuganOnSlot, bakuganToMoveType2 as bakuganToMoveType, slots_id } from "../../type/type-index.js";
import { GateCards, GateCardsList } from "../gate-gards.js";

export const MagmaSupreme: abilityCardsType = {
    key: 'magma-supreme',
    name: 'Magma Prominence',
    description: `Changes the Gate Card's attribute to Subterra.`,
    attribut: 'Subterra',
    maxInDeck: 1,
    usable_in_neutral: false,
    image: StandardCardsImages.subterra,
    onActivate: ({ roomState, userId, bakuganKey, slot }) => {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate && slotOfGate.portalCard) {
            const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)
            const gate = slotOfGate.portalCard.key

            if (user && gate) {

                if (slotOfGate.state.open === true && slotOfGate.state.canceled === false) {
                    const initialGate = GateCardsList.find((g) => g.key === gate)
                    const newGate = GateCardsList.find((g) => g.key === 'reacteur-subterra')
                    if (initialGate && initialGate.onCanceled && newGate && newGate.onOpen) {
                        initialGate.onCanceled({ roomState, slot, userId: userId, bakuganKey: bakuganKey })
                        slotOfGate.state.open = false
                        slotOfGate.state.canceled = false
                        roomState?.animations.push({
                            type: "OPEN_GATE_CARD",
                            data: {
                                slot: slotOfGate,
                                slotId: slotOfGate.id
                            },
                            resolved: false
                        })
                        newGate.onOpen({ roomState, slot, userId: userId, bakuganKey: bakuganKey })
                    }
                }

                slotOfGate.portalCard.key = 'reacteur-subterra'
            }
        }
        return null
    }
}

export const TectonicSwipe: abilityCardsType = {
    key: 'tectonic-swipe',
    name: 'Tectonic Swipe',
    maxInDeck: 1,
    description: `Cancel Gate card and Switches Gate Card with the one next to it`,
    usable_in_neutral: false,
    attribut: 'Subterra',
    onActivate: ({ roomState, userId, slot }) => {
        const animation = AbilityCardFailed({ card: TectonicSwipe.name })

        if (!roomState) return animation
        if (TectonicSwipe.activationConditions && !TectonicSwipe.activationConditions({ roomState, userId })) return animation

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
        if (!newCard) return
        const card = GateCards[newCard]
        if (card.autoActivationCheck && card.autoActivationCheck({ portalSlot: roomData.protalSlots[Slots.indexOf(resolution.slot)], roomState: roomData })) return

        const newAction: ActionType = {
            type: 'OPEN_GATE_CARD',
            slot: resolution.slot,
            gateId: newCard
        }

        const turn = roomData.turnState.turn

        const userActions = turn === resolution.userId ? roomData.ActivePlayerActionRequest : roomData.InactivePlayerActionRequest
        const actions = [...userActions.actions.mustDo, ...userActions.actions.mustDoOne, ...userActions.actions.optional].flat()

        if (actions.some((action) => action.type === newAction.type)) return
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

        const slot = roomState.protalSlots.find((slot) => slot.id === bakugan.slot_id)
        if (!slot) return false

        const juxtaposablesSlots = getJuxtaposablesSlots({ slot: slot, roomState: roomState })
        if (juxtaposablesSlots.length === 0) return false
        const swipableSlots = juxtaposablesSlots.filter((slot) => slot.portalCard !== null)
        if (swipableSlots.length === 0) return false

        return true

    },
}

export const EarthPower: abilityCardsType = {
    key: 'earth-power',
    attribut: 'Subterra',
    name: 'Earth Power',
    maxInDeck: 2,
    description: `Add 100 G to all of the user's Subterra Bakugans on the same gate card.`,
    image: StandardCardsImages.subterra,
    usable_in_neutral: false,
    onActivate({ roomState, userId, bakuganKey, slot }) {
        if (!roomState) return null

        const slotOfGate = roomState.protalSlots.find((s) => s.id === slot)
        if (!slotOfGate) return null
        const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)
        if (!user) return null

        const SubterraBakugans = slotOfGate.bakugans.filter((b) => b.attribut === "Subterra" && b.userId === userId)

        SubterraBakugans.forEach((bakugan) => {
            bakugan.currentPower += 100
            PowerChangeDirectiveAnumation({
                animations: roomState.animations,
                bakugans: [bakugan],
                powerChange: 100,
                turn: roomState.turnState.turnCount,
                malus: false
            })
        })

        return null
    },
    onCanceled({ roomState, userId, bakuganKey, slot }) {
        if (!roomState) return null

        const slotOfGate = roomState.protalSlots.find((s) => s.id === slot)
        if (!slotOfGate) return null
        const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)
        if (!user) return null

        const SubterraBakugans = slotOfGate.bakugans.filter((b) => b.attribut === "Subterra" && b.userId === userId)

        SubterraBakugans.forEach((bakugan) => {
            bakugan.currentPower -= 100
            PowerChangeDirectiveAnumation({
                animations: roomState.animations,
                bakugans: [bakugan],
                powerChange: 100,
                turn: roomState.turnState.turnCount,
                malus: true
            })
        })

        return null
    },
    canUse({ roomState, bakugan }) {
        if (!roomState) return false

        const slotOfGate = roomState.protalSlots.find((s) => s.id === bakugan.slot_id)
        if (!slotOfGate) return false

        const { battleInProcess, paused, slot } = roomState.battleState
        if (!battleInProcess || paused) return false
        if (bakugan.slot_id !== slot) return false

        return true
    },
}

export const CopieConforme: abilityCardsType = {
    key: 'copie-conforme',
    name: 'Copycat',
    attribut: 'Subterra',
    maxInDeck: 1,
    description: `Copies an ability that the opponent used or is using`,
    image: StandardCardsImages.subterra,
    usable_in_neutral: false,
    onActivate: ({ roomState, userId, bakuganKey, slot }) => {
        if (!roomState) return null
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate) {
            const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)

            if (user) {
                user.currentPower += 100
                PowerChangeDirectiveAnumation({
                    animations: roomState?.animations,
                    bakugans: [user],
                    powerChange: 100,
                    malus: false,
                    turn: roomState.turnState.turnCount

                })
            }
        }

        return null
    }
}