import { Server, Socket } from "socket.io/dist";
import { Battle_Brawlers_Game_State } from "../game-state/battle-brawlers-game-state";
import { CheckGameFinished, handleBattle, handleGateCards, updateTurnState } from "@bakugan-arena/game-data";

export const socketTurn = (io: Server, socket: Socket) => {

    // FR: On écoute l'événement "turn-action" envoyé par un joueur
    // ENG: Listen for the "turn-action" event triggered by a player
    socket.on('turn-action', ({ roomId, userId }: { roomId: string, userId: string }) => {
        
        // FR: On récupère les données de la salle correspondant au roomId
        // ENG: Retrieve the room data matching the given roomId
        const roomData = Battle_Brawlers_Game_State.find((room) => room?.roomId === roomId)

        // FR: On récupère aussi l'index de cette salle pour des modifications directes
        // ENG: Also get the room index for direct state updates
        const roomIndex = Battle_Brawlers_Game_State.findIndex((room) => room?.roomId === roomId)

        // FR: Si la salle n'existe pas ou que l'index est invalide, on arrête
        // ENG: If the room does not exist or index is invalid, exit early
        if(!roomData || roomIndex === -1) return

        // FR: Mise à jour de l'état du tour (joueur actif, compteur, autorisations, etc.)
        // ENG: Update the turn state (active player, counter, available actions, etc.)
        updateTurnState(roomData)

        // FR: Gestion de la logique des batailles (diminution de tours restants ou lancement de combat)
        // ENG: Handle battle logic (decrease remaining turns or trigger a new battle)
        handleBattle(roomData)

        // FR: Vérification et activation automatique des cartes portail si leurs conditions sont remplies
        // ENG: Check and auto-activate gate cards if their conditions are met
        handleGateCards(roomData)

        // FR: Vérification si la partie est terminée (conditions de victoire/défaite)
        // ENG: Check if the game has ended (victory/defeat conditions)
        CheckGameFinished({ roomId, roomState: roomData })

        // FR: On envoie le nouvel état du jeu à tous les joueurs de la salle
        // ENG: Emit the updated game state to all players in the room
        io.to(roomId).emit("turn-action", roomData)

    })

}
