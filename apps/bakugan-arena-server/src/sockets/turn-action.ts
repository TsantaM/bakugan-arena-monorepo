import { assertActor } from "./assert-actor"
import { Server, Socket } from "socket.io";
import { attachActionRequestsToLastTurn, canSkipTurn, CheckBattleStillInProcess, CreateActionRequestFunction, handleBattle, handleGateCards, logDiagnostic, logGameEvent, stripStateForSocket, summarizeStateForLog, turnCountSocketProps, updateTurnState } from "@bakugan-arena/game-data";
import { Battle_Brawlers_Game_State } from "../game-state/battle-brawlers-game-state";
import { CheckGameFinished } from "../functions/CheckGameFinished";
import { onBattleEnd } from "../functions/on-battle-end";
import { clearAnimationsInRoom } from "./clear-animations-socket";
import { ClearDomain } from "../functions/clear-domain";
import { UpdatePlayerTimer, grantActionIncrement } from "../functions/start-player-timer";
import { EmitMessage } from "../functions/emit-messages";
import { ActiveGateCard } from "../functions/active-gate-card";
import { emitTurnActionRequestsWithDiagnostics } from "../functions/log-turn-action-requests";
import { resumeRoomFlowWithAutoSkip } from "../functions/resume-room-flow-defaults";
import { endTurnAdvance, markTurnAdvanced, tryBeginTurnAdvance } from "../functions/turn-advance-guard";

export function turnActionUpdater({ roomId, userId, io, updateBattleState = true }: { roomId: string, userId: string, io: Server, updateBattleState?: boolean }) {
    const roomData = Battle_Brawlers_Game_State.find((room) => room?.roomId === roomId)

    const roomIndex = Battle_Brawlers_Game_State.findIndex((room) => room?.roomId === roomId)

    if (!roomData || roomIndex === -1) return
    if (roomData.status.finished === true) return

    const generation = roomData.turnState.turnCount
    if (!tryBeginTurnAdvance(roomId, generation)) {
        logDiagnostic(roomData, {
            handler: "turnActionUpdater.rejected",
            level: "warn",
            message: "Passage de tour ignoré — déjà en cours ou déjà consommé pour ce tour",
            output: { turnCount: generation, activePlayerId: roomData.turnState.turn },
        })
        return
    }

    let additionalResumeUserId: string | undefined

    try {
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

                if (result === 'additional') {
                    logDiagnostic(roomData, {
                        handler: "turnActionUpdater.earlyReturn",
                        level: "warn",
                        message: "Sortie anticipée après ActiveGateCard (additional)",
                        output: {
                            reason: result,
                            after: "ActiveGateCard",
                            gateCard: card,
                        },
                    })
                    additionalResumeUserId = card.userId
                    return
                }

                if (result === 'turn_advanced') {
                    break
                }
            }
        }

        if (roomData.battleState.turns === 0 && roomData.battleState.battleInProcess && !roomData.battleState.paused) {
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
            io.to(roomId).emit("turn-action", stripStateForSocket(roomData))
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

        markTurnAdvanced(roomId, generation)
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
        io.to(roomId).emit("turn-action", stripStateForSocket(roomData))
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
    } finally {
        endTurnAdvance(roomId)
    }

    if (additionalResumeUserId) {
        resumeRoomFlowWithAutoSkip({
            roomState: roomData,
            io,
            userId: additionalResumeUserId,
            source: "turnActionUpdater.afterActiveGateCard",
        })
    }
}

export const socketTurn = (io: Server, socket: Socket) => {

    socket.on('turn-action', ({ roomId, userId, turnCount }: { roomId: string, userId: string, turnCount?: number }) => {
        if (!assertActor(socket, userId, "turn-action")) return
        const roomData = Battle_Brawlers_Game_State.find((room) => room?.roomId === roomId)
        if (!roomData || roomData.status.finished) return

        if (roomData.turnState.turn !== userId) {
            logDiagnostic(roomData, {
                handler: "turn-action.rejected",
                level: "warn",
                message: "turn-action refusé — seul le joueur actif peut terminer le tour",
                input: { roomId, userId, turnCount },
                output: { activePlayerId: roomData.turnState.turn },
            })
            return
        }

        if (typeof turnCount === "number" && turnCount !== roomData.turnState.turnCount) {
            logDiagnostic(roomData, {
                handler: "turn-action.rejected",
                level: "warn",
                message: "turn-action refusé — turnCount obsolète (double passage)",
                input: { roomId, userId, turnCount },
                output: { currentTurnCount: roomData.turnState.turnCount },
            })
            return
        }

        if (!canSkipTurn(roomData, userId)) {
            logDiagnostic(roomData, {
                handler: "turn-action.rejected",
                level: "warn",
                message: "turn-action refusé — skip illégal (mustDo / additional / inactif)",
                input: { roomId, userId, turnCount },
                output: {
                    activePlayerId: roomData.turnState.turn,
                    mustDo: roomData.ActivePlayerActionRequest.actions.mustDo.length,
                    mustDoOne: roomData.ActivePlayerActionRequest.actions.mustDoOne.length,
                    gateAdditional: roomData.gateCardActionRequest.length,
                    abilityAdditional: roomData.AbilityAditionalRequest.length,
                },
            })
            return
        }

        logGameEvent(roomData, {
            handler: "turn-action",
            category: "socket",
            input: { roomId, userId, turnCount: roomData.turnState.turnCount },
            message: "Le joueur termine son tour",
        })

        grantActionIncrement({ roomState: roomData, userId, io })
        turnActionUpdater({ roomId, userId, io })
    })

}
