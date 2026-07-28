import {
    AbilityCardsList,
    ActivePlayerActionRequestType,
    ExclusiveAbilitiesList,
    InactivePlayerActionRequestType,
    logDiagnostic,
    removeActionByType,
    resolutionType,
    stateType,
} from "@bakugan-arena/game-data"
import { Server } from "socket.io"
import { Battle_Brawlers_Game_State } from "../game-state/battle-brawlers-game-state"
import { EmitMessage } from "./emit-messages"
import { grantActionIncrement } from "./start-player-timer"
import { clearAnimationsInRoom } from "../sockets/clear-animations-socket"
import {
    continueRoomFlowAfterAdditional,
    markAdditionalPending,
    tryEmitPendingAdditionalRequest,
} from "./resume-room-flow"

function invokeTurnActionUpdater({
    roomId,
    userId,
    io,
}: {
    roomId: string
    userId: string
    io: Server
}) {
    const { turnActionUpdater } = require("../sockets/turn-action") as typeof import("../sockets/turn-action")
    turnActionUpdater({ roomId, userId, io })
}

export function autoSkipAbilityAdditional({
    roomState,
    io,
}: {
    roomState: stateType
    io: Server
}): boolean {
    const request = roomState.AbilityAditionalRequest[0]
    if (!request) return false

    return processAbilityAdditionalResolution(io, {
        roomId: request.roomId,
        userId: request.userId,
        cardKey: request.cardKey,
        bakuganKey: request.bakuganKey,
        slot: request.slot,
        data: { type: "SKIP_ACTION" },
    })
}

export function processAbilityAdditionalResolution(
    io: Server,
    resolution: resolutionType,
): boolean {
    clearAnimationsInRoom(resolution.roomId)
    const roomData = Battle_Brawlers_Game_State.find(
        (room) => room?.roomId === resolution.roomId,
    )
    const roomIndex = Battle_Brawlers_Game_State.findIndex(
        (room) => room?.roomId === resolution.roomId,
    )
    if (!roomData || roomIndex === -1 || roomData.status.finished) return false

    const request = roomData.AbilityAditionalRequest.find(
        (req) =>
            req.bakuganKey === resolution.bakuganKey &&
            req.cardKey === resolution.cardKey &&
            req.userId === resolution.userId,
    )
    const requestIndex = roomData.AbilityAditionalRequest.findIndex(
        (req) =>
            req.bakuganKey === resolution.bakuganKey &&
            req.cardKey === resolution.cardKey &&
            req.userId === resolution.userId,
    )

    if (!request || requestIndex === -1) {
        logDiagnostic(roomData, {
            handler: "ability-additional.resolved",
            level: "warn",
            message: "Résolution ability additional — requête introuvable",
            input: resolution,
        })
        return false
    }

    const roomState = Battle_Brawlers_Game_State[roomIndex]
    if (!roomState) return false

    const ability = [AbilityCardsList, ExclusiveAbilitiesList]
        .flat()
        .find((entry) => entry.key === request.cardKey)
    if (!ability?.onAdditionalEffect) return false

    const result = ability.onAdditionalEffect({
        resolution,
        roomData: roomState,
    })

    roomState.AbilityAditionalRequest.splice(requestIndex, 1)

    logDiagnostic(roomData, {
        handler: "ability-additional.resolved",
        message: "Résolution ability additional traitée",
        output: {
            cardKey: request.cardKey,
            bakuganKey: request.bakuganKey,
            resolutionType: resolution.data.type,
            remainingAbilityRequests: roomState.AbilityAditionalRequest.length,
            autoResolved: resolution.data.type === "SKIP_ACTION",
        },
    })

    io.to(roomData.roomId).emit("animations", roomState.animations)
    roomState.animations.forEach((animation) =>
        EmitMessage({ roomState, animation, io }),
    )
    roomState.animations = []

    const actingUserId = request.data.target ?? request.userId
    grantActionIncrement({ roomState: roomData, userId: actingUserId, io })

    if (roomState.AbilityAditionalRequest.length > 0) {
        markAdditionalPending(roomData.roomId)
        tryEmitPendingAdditionalRequest(roomData, io)
        return true
    }

    if (roomData.turnState.turn === resolution.userId) {
        if (
            !roomData.battleState.battleInProcess ||
            roomData.battleState.paused
        ) {
            const withoutBakugan = removeActionByType(
                roomState.ActivePlayerActionRequest,
                "SET_BAKUGAN",
            )
            roomState.ActivePlayerActionRequest =
                withoutBakugan as ActivePlayerActionRequestType

            const withoutGate = removeActionByType(
                roomState.ActivePlayerActionRequest,
                "SET_GATE_CARD_ACTION",
            )
            roomState.ActivePlayerActionRequest =
                withoutGate as ActivePlayerActionRequestType
        }

        const withoutAbility = removeActionByType(
            roomState.ActivePlayerActionRequest,
            "USE_ABILITY_CARD",
        )
        roomState.ActivePlayerActionRequest =
            withoutAbility as ActivePlayerActionRequestType
    } else {
        const withoutAbility = removeActionByType(
            roomState.InactivePlayerActionRequest,
            "USE_ABILITY_CARD",
        )
        roomState.InactivePlayerActionRequest =
            withoutAbility as InactivePlayerActionRequestType
    }

    if (result?.turnActionLaucher) {
        invokeTurnActionUpdater({
            roomId: roomData.roomId,
            userId: resolution.userId,
            io,
        })
        return true
    }

    continueRoomFlowAfterAdditional({
        roomState: roomData,
        io,
        userId: resolution.userId,
        source: "ability-additional-resolution.after",
    })
    return true
}
