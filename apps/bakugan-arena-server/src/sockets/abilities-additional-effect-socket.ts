import { logDiagnostic, resolutionType } from "@bakugan-arena/game-data"
import { Server, Socket } from "socket.io"
import { Battle_Brawlers_Game_State } from "../game-state/battle-brawlers-game-state"
import { processAbilityAdditionalResolution } from "../functions/ability-additional-resolution"
import { isAbilityResolutionAllowed } from "../functions/validate-additional-resolution"
import { assertActor } from "./assert-actor"

export function AbilitiesAdditionalEffectsSocket(io: Server, socket: Socket) {
    socket.on("ability-additional-request", (resolution: resolutionType) => {
        const roomState = Battle_Brawlers_Game_State.find((r) => r?.roomId === resolution.roomId)
        const request = roomState?.AbilityAditionalRequest.find(
            (req) =>
                req.bakuganKey === resolution.bakuganKey &&
                req.cardKey === resolution.cardKey &&
                req.userId === resolution.userId,
        )

        // Joueur autorisé à répondre : le lanceur, sauf si la request désigne
        // explicitement l'adversaire (`data.target`).
        const responder = request?.data.target ?? request?.userId ?? resolution.userId
        if (!assertActor(socket, responder, "ability-additional-request")) return

        if (request && !isAbilityResolutionAllowed(request, resolution)) {
            logDiagnostic(roomState!, {
                handler: "ability-additional.rejected",
                level: "warn",
                message: "Résolution hors des choix proposés par le serveur",
                input: resolution,
                output: { offered: request.data.type },
            })
            socket.emit("action-rejected", {
                event: "ability-additional-request",
                reason: "RESOLUTION_NOT_OFFERED",
            })
            return
        }

        processAbilityAdditionalResolution(io, resolution)
    })
}
