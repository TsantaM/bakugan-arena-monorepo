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
}: {
    roomState: stateType
    io: Server
    userId: string
    source: string
}) {
    resumeRoomFlow({
        roomState,
        io,
        userId,
        source,
        autoSkipGateAdditional,
        autoSkipAbilityAdditional,
    })
}
