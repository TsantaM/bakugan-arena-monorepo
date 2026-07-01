import {
    type activeGateCardProps,
    GateCardsList,
    type gateCardActionRequestsType,
    type stateType,
    type slots_id
} from "@bakugan-arena/game-data"

export const SimulateActiveGateCard = ({
    roomState,
    gateId,
    slot,
    userId
}: Omit<activeGateCardProps, "roomId" | "io"> & {
    roomState: stateType
}): stateType | undefined => {

    let state = structuredClone(roomState)

    const slotOfGate = state.protalSlots.find(
        (s) => s.id === slot
    )

    const gateCard = GateCardsList.find(
        (g) => g.key === gateId
    )

    if (
        !slotOfGate ||
        slotOfGate.portalCard?.key !== gateId ||
        slotOfGate.state.open ||
        slotOfGate.state.blocked ||
        !gateCard
    ) {
        return
    }

    const bakugan =
        slotOfGate.bakugans.find(
            (b) => b.userId === userId
        )?.key

    const bakuganKey =
        bakugan === undefined || bakugan === ""
            ? ""
            : bakugan

    // ouverture de la gate
    slotOfGate.state.open = true

    const openFunction = gateCard.onOpen?.({
        roomState: state,
        slot: slot as slots_id,
        bakuganKey,
        userId,
    })

    if (!openFunction) {
        return state
    }

    // si la gate génère une demande supplémentaire,
    // on la stocke comme le serveur le ferait
    if (openFunction.type !== "TURN_ACTION_LAUNCHER") {

        const request: gateCardActionRequestsType = {
            roomId: state.roomId,
            cardKey: gateCard.key,
            slot,
            userId,
            data: openFunction
        }

        state.gateCardActionRequest = [
            ...state.gateCardActionRequest,
            request
        ]
    }

    return state
}