import type { ActionType } from "../../type/actions-serveur-requests";
import type { stateType } from "../../type/room-types";

export function OpenGateCardActionRequest({ roomState }: { roomState: stateType }) {

    if (!roomState) return

    const { battleInProcess, paused, slot } = roomState.battleState
    if (slot === null) return
    const { turn } = roomState.turnState
    const { ActivePlayerActionRequest, protalSlots } = roomState

    if (battleInProcess && !paused) {
        const slotOfBattle = protalSlots.find((s) => s.id === slot)

        if (!slotOfBattle) return

        const { state, portalCard } = slotOfBattle

        if (portalCard === null) return
        if (state.blocked || state.open || state.canceled) return
        if (portalCard.userId !== turn) return

        const request: ActionType = {
            type: 'OPEN_GATE_CARD',
            slot: slot,
            gateId: portalCard.key
        }

        ActivePlayerActionRequest.actions.optional.push(request)

    }

}