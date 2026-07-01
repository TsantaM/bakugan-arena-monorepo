import {
    type setGateCardProps,
    type stateType,
    updateDeckGates,
    updateSlot,
    SetBakuganActionRequest
} from "@bakugan-arena/game-data"

export const SimulateUpdateGate = ({
    roomState,
    gateId,
    slot,
    userId
}: {
    roomState: stateType
} & Omit<setGateCardProps, "roomId">): stateType | undefined => {

    const usable_slot =
        roomState.protalSlots.find((s) => s.id === slot)?.can_set

    const can_set_gate =
        roomState.turnState.set_new_gate

    const notTurnAndTurn0 =
        roomState.turnState.previous_turn !== userId &&
        roomState.turnState.turnCount > 0

    const canPlaceGate =
        usable_slot &&
        can_set_gate &&
        notTurnAndTurn0

    // si tu veux reproduire le comportement réel
    // décommente cette ligne
    if (!canPlaceGate) return

    const slotToUpdate =
        roomState.protalSlots.find((s) => s.id === slot)

    const deckToUpdate =
        roomState.decksState.find((s) => s.userId === userId)

    const player =
        roomState.players.find((p) => p.userId === userId)

    if (!slotToUpdate || !deckToUpdate || !player) return

    const newSlotState = {
        ...slotToUpdate,
        can_set: false,
        portalCard: {
            key: gateId,
            userId
        }
    }

    const newDeckState = {
        ...deckToUpdate,
        gates: updateDeckGates(deckToUpdate, gateId)
    }

    let newState: stateType = {
        ...roomState,
        players: roomState.players.map((p) =>
            p.userId === player.userId
                ? {
                    ...p,
                    usable_gates: p.usable_gates - 1
                }
                : p
        ),
        protalSlots: updateSlot(
            roomState.protalSlots,
            slotToUpdate.id,
            newSlotState
        ),
        decksState: roomState.decksState.map((d) =>
            d.userId === userId
                ? {
                    ...d,
                    gates: newDeckState.gates
                }
                : d
        )
    }

    const action =
        newState.turnState.turn === userId
            ? newState.ActivePlayerActionRequest
            : newState.InactivePlayerActionRequest

    const merged = [
        ...action.actions.mustDo,
        ...action.actions.mustDoOne,
        ...action.actions.optional
    ].flat()

    if (!merged.some((a) => a.type === "SET_BAKUGAN")) {
        const clonedState = structuredClone(newState)

        SetBakuganActionRequest({
            roomState: clonedState
        })

        newState = clonedState
    }

    return newState
}