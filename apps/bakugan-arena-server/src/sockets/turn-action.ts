import { Server, Socket } from "socket.io/dist";
import { Battle_Brawlers_Game_State } from "../game-state/battle-brawlers-game-state";
import { ActivePlayerActionRequestType, CheckBattleStillInProcess, CreateActionRequestFunction, handleBattle, handleGateCards, InactivePlayerActionRequestType, Message, turnCountSocketProps, updateTurnState } from "@bakugan-arena/game-data";
import { CheckGameFinished } from "../functions/CheckGameFinished";
import { onBattleEnd } from "../functions/on-battle-end";
import { clearAnimationsInRoom } from "./clear-animations-socket";
import { ClearDomain } from "../functions/clear-domain";

function checkActions(request: ActivePlayerActionRequestType | InactivePlayerActionRequestType) {
    const mustDo = request.actions.mustDo
    const mustDoOne = request.actions.mustDoOne
    const optional = request.actions.optional

    const merged = [mustDo, mustDoOne, optional]

    return merged.length

}

export function turnActionUpdater({ roomId, userId, io, updateBattleState = true }: { roomId: string, userId: string, io: Server, updateBattleState?: boolean }) {
    const roomData = Battle_Brawlers_Game_State.find((room) => room?.roomId === roomId)

    // FR: On récupère aussi l'index de cette salle pour des modifications directes
    // ENG: Also get the room index for direct state updates
    const roomIndex = Battle_Brawlers_Game_State.findIndex((room) => room?.roomId === roomId)

    // FR: Si la salle n'existe pas ou que l'index est invalide, on arrête
    // ENG: If the room does not exist or index is invalid, exit early
    if (!roomData || roomIndex === -1) return

    // FR: Mise à jour de l'état du tour (joueur actif, compteur, autorisations, etc.)
    // ENG: Update the turn state (active player, counter, available actions, etc.)
    updateTurnState(roomData)

    // FR: Gestion de la logique des batailles (diminution de tours restants ou lancement de combat)
    // ENG: Handle battle logic (decrease remaining turns or trigger a new battle)
    handleBattle(roomData, updateBattleState)

    // FR: Vérification et activation automatique des cartes portail si leurs conditions sont remplies
    // ENG: Check and auto-activate gate cards if their conditions are met
    handleGateCards(roomData)


    if (roomData && roomData.battleState.turns === 0 && roomData.battleState.battleInProcess && !roomData.battleState.paused) {
        onBattleEnd({ roomId })
        CheckGameFinished({ roomId, roomState: roomData })
    }

    // FR: Vérification si la partie est terminée (conditions de victoire/défaite)
    // ENG: Check if the game has ended (victory/defeat conditions)
    CheckGameFinished({ roomId, roomState: roomData })

    CheckBattleStillInProcess(roomData)

    ClearDomain(roomData, userId)

    CreateActionRequestFunction({ roomState: roomData })

    // FR: On envoie le nouvel état du jeu à tous les joueurs de la salle
    // ENG: Emit the updated game state to all players in the room
    const animations = roomData.animations
    io.to(roomId).emit("turn-action", roomData)
    io.to(roomId).emit('animations', animations)

    const activeSocket = roomData.connectedsUsers.get(roomData.turnState.turn)
    const activeName = roomData.players.find((p) => p.userId === roomData.turnState.turn)?.username
    const inactiveSocket = roomData.connectedsUsers.get(roomData.turnState.previous_turn || '')
    const inactiveName = roomData.players.find((p) => p.userId === roomData.turnState.previous_turn || '')?.username

    const turnState: turnCountSocketProps = {
        turnCount: roomData.turnState.turnCount,
        battleTurn: roomData.battleState.battleInProcess ? roomData.battleState.turns : undefined
    }

    io.to(roomId).emit('turn-count-updater', turnState)

    if (roomData.status.finished) {

        let message: Message

        if (roomData.status.winner !== null) {
            const winner = roomData.players.find((p) => p.userId === roomData.status.winner)?.username ? roomData.players.find((p) => p.userId === roomData.status.winner)?.username : ''

            message = {
                text: `Game is over ! The winner is ${winner}`
            }

        } else {
            message = {
                text: `Game is over ! Equality !`
            }
        }

        io.to(roomId).emit('game-finished', message)

    }

    console.log('turn count', roomData.turnState.turnCount)
    console.log('active socket', roomData.ActivePlayerActionRequest, activeName);
    console.log('inactive socket', roomData.InactivePlayerActionRequest, inactiveName)

    clearAnimationsInRoom(roomId)

    const activeActionsCount = checkActions(roomData.ActivePlayerActionRequest)
    const inactiveActionsCount = checkActions(roomData.InactivePlayerActionRequest)

    if (activeActionsCount > 0 || inactiveActionsCount > 0) {
        if (activeSocket) {
            const request = roomData.ActivePlayerActionRequest
            io.to(activeSocket).emit('turn-action-request', request)
        }

        if (inactiveSocket) {
            const request = roomData.InactivePlayerActionRequest
            const merged = [
                request.actions.mustDo,
                request.actions.mustDoOne,
                request.actions.optional
            ].flat()

            if (merged.length > 0) {
                io.to(inactiveSocket).emit('turn-action-request', request)
            }

        }
    } else {
        return turnActionUpdater({
            roomId: roomId,
            userId: userId,
            io: io,
            updateBattleState: true
        })
    }

}

export const socketTurn = (io: Server, socket: Socket) => {

    // FR: On écoute l'événement "turn-action" envoyé par un joueur
    // ENG: Listen for the "turn-action" event triggered by a player
    socket.on('turn-action', ({ roomId, userId }: { roomId: string, userId: string }) => {
        turnActionUpdater({ roomId, userId, io })
    })

}