import { Server } from "socket.io"
import { stateType } from "@bakugan-arena/game-data"
import { autoSkipAbilityAdditional } from "./ability-additional-resolution"
import { autoSkipGateAdditional } from "./gate-additional-resolution"
import { resumeRoomFlow } from "./resume-room-flow"

export function resumeRoomFlowWithAutoSkip({
    roomState,
    io,
    userId,
    source,
    onlyUserId,
}: {
    roomState: stateType
    io: Server
    userId: string
    source: string
    /** Si défini, ne réémet les turn-actions qu'à ce joueur. */
    onlyUserId?: string
}) {
    resumeRoomFlow({
        roomState,
        io,
        userId,
        source,
        autoSkipGateAdditional,
        autoSkipAbilityAdditional,
        onlyUserId,
    })
}
