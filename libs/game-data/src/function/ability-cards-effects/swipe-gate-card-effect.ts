import { GateCards } from "../../battle-brawlers/index.js"
import { Slots } from "../../store/slots.js"
import { ActionType, AnimationDirectivesTypes, slots_id, stateType } from "../../type/type-index.js"
import { CancelGateCardDirectiveAnimation } from "../create-animation-directives/index.js"

type SwipeGateCardEffectProps = {
    selectedSlotId: slots_id,
    roomData: stateType,
    userSlotId: slots_id,
    bakuganKey: string,
    userId: string
}

export function SwipeGateCardEffect({ roomData, selectedSlotId, userSlotId, bakuganKey, userId }: SwipeGateCardEffectProps) {
    const slot = roomData.protalSlots[Slots.indexOf(selectedSlotId)]
    const userSlot = roomData.protalSlots[Slots.indexOf(userSlotId)]

    if (userSlot.state.open && !userSlot.state.canceled && userSlot.portalCard) {
        const gate = GateCards[userSlot.portalCard.key]
        if (gate) {
            CancelGateCardDirectiveAnimation({ animationsForReplay: roomData.animationsForReplay, animations: roomData.animations, slot: structuredClone(userSlot), turn: roomData.turnState.turnCount })

            if (gate.onCanceled) gate.onCanceled({ roomState: roomData, slot: userSlot.id, userId: userId, bakuganKey: bakuganKey })

            roomData.protalSlots[Slots.indexOf(userSlotId)].state.canceled = true
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
    roomData.protalSlots[Slots.indexOf(userSlotId)].portalCard = slot1Card
    roomData.protalSlots[Slots.indexOf(userSlotId)].state = slot1State


    roomData.animations.push(animation)
    roomData.animationsForReplay.push(animation)


    const newCard = roomData.protalSlots[Slots.indexOf(userSlotId)].portalCard?.key
    if (!newCard) return
    const card = GateCards[newCard]
    if (card.autoActivationCheck && card.autoActivationCheck({ portalSlot: roomData.protalSlots[Slots.indexOf(userSlotId)], roomState: roomData })) return

    const newAction: ActionType = {
        type: 'OPEN_GATE_CARD',
        slot: userSlotId,
        gateId: newCard
    }

    const turn = roomData.turnState.turn

    const userActions = turn === userId ? roomData.ActivePlayerActionRequest : roomData.InactivePlayerActionRequest
    const actions = [...userActions.actions.mustDo, ...userActions.actions.mustDoOne, ...userActions.actions.optional].flat()

    if (actions.some((action) => action.type === newAction.type)) return
    userActions.actions.optional.push(newAction)
}