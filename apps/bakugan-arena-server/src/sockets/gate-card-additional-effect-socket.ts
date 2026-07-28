import { resolutionGateCardType } from "@bakugan-arena/game-data"
import { Server, Socket } from "socket.io"
import { processGateAdditionalResolution } from "../functions/gate-additional-resolution"

export function GateCardAdditionalEffectSocket(io: Server, socket: Socket) {
    socket.on("gate-card-additional-request", (resolution: resolutionGateCardType) => {
        processGateAdditionalResolution(io, resolution)
    })
}
