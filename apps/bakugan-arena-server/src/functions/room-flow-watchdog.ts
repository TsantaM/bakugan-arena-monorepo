import { Server } from "socket.io"
import { Battle_Brawlers_Game_State } from "../game-state/battle-brawlers-game-state"
import { resumeRoomFlowWithAutoSkip } from "./resume-room-flow-defaults"

const WATCHDOG_INTERVAL_MS = 30_000

export function startRoomFlowWatchdog(io: Server) {
    setInterval(() => {
        for (const roomState of Battle_Brawlers_Game_State) {
            if (!roomState || roomState.status.finished) continue

            const hasPendingAdditional =
                roomState.gateCardActionRequest.length > 0 ||
                roomState.AbilityAditionalRequest.length > 0

            if (!hasPendingAdditional) continue

            resumeRoomFlowWithAutoSkip({
                roomState,
                io,
                userId: roomState.turnState.turn,
                source: "room-flow-watchdog",
            })
        }
    }, WATCHDOG_INTERVAL_MS)
}
