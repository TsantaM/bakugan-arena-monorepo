import {
    ActivePlayerActionRequestType,
    handleGateCards,
    InactivePlayerActionRequestType,
    logGameEvent,
    removeActionByType,
    stateType,
} from "@bakugan-arena/game-data"
import { Server } from "socket.io"
import { ActiveGateCard, ActiveGateCardResult } from "./active-gate-card"
import { resumeRoomFlowWithAutoSkip } from "./resume-room-flow-defaults"

export type ProcessAutoOpenableGatesResult = Exclude<ActiveGateCardResult, false> | "none"

/**
 * Opens gates that became eligible after an unblock (e.g. Dive Mirage canceled).
 * Mirrors the auto-open loop in turnActionUpdater.
 */
export function processAutoOpenableGates({
    roomState,
    roomId,
    io,
    source,
}: {
    roomState: stateType
    roomId: string
    io: Server
    source: string
}): ProcessAutoOpenableGatesResult {
    const opennable = handleGateCards(roomState)
    if (opennable.length === 0) return "none"

    logGameEvent(roomState, {
        handler: "processAutoOpenableGates",
        category: "engine",
        output: { autoOpenCount: opennable.length, gates: opennable, source },
        message: `${opennable.length} gate(s) éligible(s) à l'ouverture auto après déblocage`,
    })

    let lastOpened: ProcessAutoOpenableGatesResult = "none"

    for (const card of opennable) {
        const result = ActiveGateCard({
            gateId: card.gateId,
            roomId,
            slot: card.slot,
            userId: card.userId,
            io,
            skipBattleTurnDecrement: true,
        })

        if (result !== false) {
            // Drop manual OPEN_GATE_CARD if refreshGateCardOpenEligibility already queued it
            if (roomState.turnState.turn === card.userId) {
                roomState.ActivePlayerActionRequest = removeActionByType(
                    roomState.ActivePlayerActionRequest,
                    "OPEN_GATE_CARD",
                ) as ActivePlayerActionRequestType
            } else {
                roomState.InactivePlayerActionRequest = removeActionByType(
                    roomState.InactivePlayerActionRequest,
                    "OPEN_GATE_CARD",
                ) as InactivePlayerActionRequestType
            }
        }

        if (result === "additional") {
            resumeRoomFlowWithAutoSkip({
                roomState,
                io,
                userId: card.userId,
                source: `${source}.afterActiveGateCard`,
            })
            return "additional"
        }

        if (result === "turn_advanced") {
            return "turn_advanced"
        }

        if (result === "opened") {
            lastOpened = "opened"
        }
    }

    return lastOpened
}
