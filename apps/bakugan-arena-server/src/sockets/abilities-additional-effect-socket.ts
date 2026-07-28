import { resolutionType } from "@bakugan-arena/game-data"
import { Server, Socket } from "socket.io"
import { processAbilityAdditionalResolution } from "../functions/ability-additional-resolution"

export function AbilitiesAdditionalEffectsSocket(io: Server, socket: Socket) {
    socket.on("ability-additional-request", (resolution: resolutionType) => {
        processAbilityAdditionalResolution(io, resolution)
    })
}
