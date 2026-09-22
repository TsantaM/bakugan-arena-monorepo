import { logDiagnostic, resolutionGateCardType } from "@bakugan-arena/game-data"
import { Server, Socket } from "socket.io"
import { Battle_Brawlers_Game_State } from "../game-state/battle-brawlers-game-state"
import { processGateAdditionalResolution } from "../functions/gate-additional-resolution"
import { isGateResolutionAllowed } from "../functions/validate-additional-resolution"
import { assertActor } from "./assert-actor"

export function GateCardAdditionalEffectSocket(io: Server, socket: Socket) {
    socket.on("gate-card-additional-request", (resolution: resolutionGateCardType) => {
        const roomState = Battle_Brawlers_Game_State.find((r) => r?.roomId === resolution.roomId)
        const request = roomState?.gateCardActionRequest.find(
            (req) =>
                req.cardKey === resolution.cardKey &&
                req.slot === resolution.slot &&
                req.userId === resolution.userId,
        )

        const responder = request?.data.target ?? request?.userId ?? resolution.userId
        if (!assertActor(socket, responder, "gate-card-additional-request")) return

        if (request && !isGateResolutionAllowed(request, resolution)) {
            logDiagnostic(roomState!, {
                handler: "gate-additional.rejected",
                level: "warn",
                message: "Résolution hors des choix proposés par le serveur",
                input: resolution,
                output: { offered: request.data.type },
            })
            socket.emit("action-rejected", {
                event: "gate-card-additional-request",
                reason: "RESOLUTION_NOT_OFFERED",
            })
            return
        }

        processGateAdditionalResolution(io, resolution)
    })
}
