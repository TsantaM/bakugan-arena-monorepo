import { activeGateCardProps, AnimationDirectivesTypes, gateCardActionRequestsType, GateCardsList, GetUserName, pushReplayAnimation } from "@bakugan-arena/game-data"
import { Battle_Brawlers_Game_State } from "../game-state/battle-brawlers-game-state"
import { turnActionUpdater } from "../sockets/turn-action"
import { EmitMessage } from "./emit-messages"
import { StartPlayerTime, StopPlayerTimer } from "./start-player-timer"

/**
 * - false : rien ouvert
 * - opened : gate ouverte, animations encore dans roomState (à émettre par l'appelant)
 * - additional : additional request envoyée, animations déjà émises
 * - turn_advanced : TURN_ACTION_LAUNCHER déjà traité (turnActionUpdater déjà appelé)
 */
export type ActiveGateCardResult = false | "opened" | "additional" | "turn_advanced"

export const ActiveGateCard = ({ roomId, gateId, slot, userId, io }: activeGateCardProps): ActiveGateCardResult => {
    const roomData = Battle_Brawlers_Game_State.find((room) => room?.roomId === roomId)

    if (!roomData) return false

    const slotOfGate = roomData.protalSlots.find((s) => s.id === slot)
    const gateCard = GateCardsList.find((g) => g.key === gateId)

    if (
        !slotOfGate ||
        slotOfGate.portalCard?.key !== gateId ||
        slotOfGate.state.open ||
        slotOfGate.state.blocked ||
        !gateCard
    ) {
        return false
    }

    const bakugan = slotOfGate.bakugans.find((b) => b.userId === userId)?.key
    const key = bakugan === undefined || bakugan === "" ? undefined : bakugan

    const clone = structuredClone(slotOfGate)

    const animation: AnimationDirectivesTypes = {
        type: "OPEN_GATE_CARD",
        data: {
            slot: clone,
            slotId: clone.id,
        },
        resolved: false,
        message: [
            {
                text: `Gate Card Open ! ${gateCard.name}`,
                userName: GetUserName({ roomData: roomData, userId: userId }),
                turn: roomData.turnState.turnCount,
            },
            {
                text: `${gateCard.description}`,
                turn: roomData.turnState.turnCount,
                description: true,
            },
        ],
    }

    roomData.animations.push(animation)
    pushReplayAnimation(roomData, animation)
    const openFunction = gateCard.onOpen?.({
        roomState: roomData,
        slot: slot,
        bakuganKey: key,
        userId: userId,
    })
    slotOfGate.state.open = true

    // Pas d'effet additionnel : l'appelant émet les animations
    if (!openFunction) return "opened"
    if (!io) return "opened"

    const batch = [...roomData.animations]
    io.to(roomId).emit("animations", batch)
    batch.forEach((a) => EmitMessage({ roomState: roomData, animation: a, io }))
    roomData.animations = []

    if (openFunction.type === "TURN_ACTION_LAUNCHER") {
        turnActionUpdater({
            io: io,
            roomId: roomId,
            userId: userId,
        })
        return "turn_advanced"
    }

    const request: gateCardActionRequestsType = {
        roomId: roomId,
        cardKey: gateCard.key,
        slot: slot,
        userId: userId,
        data: openFunction,
    }

    roomData.gateCardActionRequest.push(request)

    const requests = roomData.gateCardActionRequest
    if (!requests.length) return "opened"

    const targetSocket = requests[0].data.target
        ? roomData.connectedsUsers.get(requests[0].data.target)
        : roomData.connectedsUsers.get(requests[0].userId)
    if (!targetSocket) return "additional"

    io.to(targetSocket.gameboardSocket).emit("gate-card-additional-request", requests[0])
    const targetId = requests[0].data.target ? requests[0].data.target : requests[0].userId

    roomData.players.forEach((p) => {
        if (p.userId !== targetId) {
            StopPlayerTimer({
                roomState: roomData,
                userId: p.userId,
            })
        } else {
            StartPlayerTime({
                roomState: roomData,
                userId: p.userId,
                io: io,
            })
        }
    })

    return "additional"
}
