import { Server, Socket } from "socket.io";
import { attachActionRequestsToLastTurn, CheckBattleStillInProcess, CreateActionRequestFunction, handleBattle, handleGateCards, logDiagnostic, logGameEvent, Message, summarizeStateForLog, turnCountSocketProps, updateTurnState } from "@bakugan-arena/game-data";
import { Battle_Brawlers_Game_State } from "../game-state/battle-brawlers-game-state";
import { CheckGameFinished } from "../functions/CheckGameFinished";
import { onBattleEnd } from "../functions/on-battle-end";
import { clearAnimationsInRoom } from "./clear-animations-socket";
import { ClearDomain } from "../functions/clear-domain";
import { UpdatePlayerTimer, grantActionIncrement, syncClocks } from "../functions/start-player-timer";
import { EmitMessage } from "../functions/emit-messages";
import { ActiveGateCard } from "../functions/active-gate-card";
import { emitTurnActionRequestsWithDiagnostics } from "../functions/log-turn-action-requests";
import { resumeRoomFlowWithAutoSkip } from "../functions/resume-room-flow-defaults";

export function turnActionUpdater({ roomId, userId, io, updateBattleState = true }: { roomId: string, userId: string, io: Server, updateBattleState?: boolean }) {
    const roomData = Battle_Brawlers_Game_State.find((room) => room?.roomId === roomId)

    const roomIndex = Battle_Brawlers_Game_State.findIndex((room) => room?.roomId === roomId)

    if (!roomData || roomIndex === -1) return
    if (roomData.status.finished === true) return

    const battleBefore = summarizeStateForLog(roomData)
    handleBattle(roomData, updateBattleState)
    const battleAfter = summarizeStateForLog(roomData)

    if (battleBefore.battleTurns !== battleAfter.battleTurns || battleBefore.battleInProcess !== battleAfter.battleInProcess) {
        logGameEvent(roomData, {
            handler: "handleBattle",
            category: "battle",
            input: battleBefore,
            output: battleAfter,
            message: "Mise à jour de l'état de bataille",
        })
    }

    const opennable = handleGateCards(roomData)

    if (opennable.length > 0) {
        logGameEvent(roomData, {
            handler: "handleGateCards",
            category: "engine",
            output: { autoOpenCount: opennable.length, gates: opennable },
            message: `${opennable.length} gate(s) éligible(s) à l'ouverture auto`,
        })

        for (const card of opennable) {
            const result = ActiveGateCard({
                gateId: card.gateId,
                roomId: roomId,
                slot: card.slot,
                userId: card.userId,
                io: io,
                skipBattleTurnDecrement: true,
            })

            logGameEvent(roomData, {
                handler: "ActiveGateCard",
                category: "engine",
                input: card,
                output: { result },
                message: `Activation auto gate ${card.gateId}`,
            })

            if (result === 'additional' || result === 'turn_advanced') {
                logDiagnostic(roomData, {
                    handler: "turnActionUpdater.earlyReturn",
                    level: "warn",
                    message: `Sortie anticipée après ActiveGateCard (${result})`,
                    output: {
                        reason: result,
                        after: "ActiveGateCard",
                        gateCard: card,
                    },
                })
                if (result === "additional") {
                    resumeRoomFlowWithAutoSkip({
                        roomState: roomData,
                        io,
                        userId: card.userId,
                        source: "turnActionUpdater.afterActiveGateCard",
                    })
                } else {
                    syncClocks({ roomState: roomData, io })
                }
                return
            }
        }
    }

    if (roomData && roomData.battleState.turns === 0 && roomData.battleState.battleInProcess && !roomData.battleState.paused) {
        logGameEvent(roomData, {
            handler: "onBattleEnd",
            category: "battle",
            message: "Fin de bataille déclenchée",
        })
        onBattleEnd({ roomId })
        CheckGameFinished({ roomId, roomState: roomData, io })
    }

    CheckGameFinished({ roomId, roomState: roomData, io })
    if (roomData.status.finished) {
        const animations = roomData.animations
        io.to(roomId).emit("turn-action", roomData)
        if (animations.length > 0) {
            io.to(roomId).emit('animations', animations)
            animations.forEach((animation) => EmitMessage({ roomState: roomData, animation, io }))
            clearAnimationsInRoom(roomId)
        }

        const turnState: turnCountSocketProps = {
            turnCount: roomData.turnState.turnCount,
            battleTurn: roomData.battleState.battleInProcess ? roomData.battleState.turns : undefined
        }
        io.to(roomId).emit('turn-count-updater', turnState)
        return
    }

    CheckBattleStillInProcess(roomData)

    ClearDomain(roomData, userId)

    updateTurnState(roomData)

    CreateActionRequestFunction({ roomState: roomData })

    logGameEvent(roomData, {
        handler: "CreateActionRequestFunction",
        category: "engine",
        output: {
            active: roomData.ActivePlayerActionRequest.actions,
            inactive: roomData.InactivePlayerActionRequest.actions,
        },
        message: "Actions disponibles recalculées",
    })

    attachActionRequestsToLastTurn(roomData)

    const animations = roomData.animations
    io.to(roomId).emit("turn-action", roomData)
    io.to(roomId).emit('animations', animations)
    roomData.animations.forEach((animation) => EmitMessage({ roomState: roomData, animation, io }))

    const turnState: turnCountSocketProps = {
        turnCount: roomData.turnState.turnCount,
        battleTurn: roomData.battleState.battleInProcess ? roomData.battleState.turns : undefined
    }

    io.to(roomId).emit('turn-count-updater', turnState)

    clearAnimationsInRoom(roomId)

    emitTurnActionRequestsWithDiagnostics({
        roomState: roomData,
        io,
        userId,
        source: "turnActionUpdater",
    })

    UpdatePlayerTimer({
        io: io,
        roomState: roomData
    })
}

export const socketTurn = (io: Server, socket: Socket) => {

    socket.on('turn-action', ({ roomId, userId }: { roomId: string, userId: string }) => {
        const roomData = Battle_Brawlers_Game_State.find((room) => room?.roomId === roomId)
        if (!roomData || roomData.status.finished) return

        if (roomData.turnState.turn !== userId) {
            logDiagnostic(roomData, {
                handler: "turn-action.rejected",
                level: "warn",
                message: "turn-action refusé — seul le joueur actif peut terminer le tour",
                input: { roomId, userId },
                output: { activePlayerId: roomData.turnState.turn },
            })
            return
        }

        logGameEvent(roomData, {
            handler: "turn-action",
            category: "socket",
            input: { roomId, userId },
            message: "Le joueur termine son tour",
        })

        grantActionIncrement({ roomState: roomData, userId, io })
        turnActionUpdater({ roomId, userId, io })
    })

}
