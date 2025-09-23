import { Battle_Brawlers_Game_State } from "../game-state/battle-brawlers-game-state"

export const CheckBattle = ({ roomId }: { roomId: string }) => {
    // FR : On cherche la room correspondant à l'ID donné
    // EN : Find the room that matches the given roomId
    const roomData = Battle_Brawlers_Game_State.find((room) => room?.roomId === roomId)

    // FR : On récupère aussi l'index de cette room dans le tableau global (utile pour la modifier directement)
    // EN : Also get the index of this room in the global array (to update it directly)
    const roomIndex = Battle_Brawlers_Game_State.findIndex((room) => room?.roomId === roomId)

    if (roomData) {
        // FR : On vérifie si un slot contient au moins deux Bakugans (condition pour démarrer une bataille)
        // EN : Check if any slot contains at least two Bakugans (condition to start a battle)
        const slotWithTwoBakugans = roomData.protalSlots.find((s) => s.bakugans.length >= 2)

        // FR : Si un tel slot existe et que la room est bien trouvée dans l'état global
        // EN : If such a slot exists and the room is found in the global state
        if (slotWithTwoBakugans && Battle_Brawlers_Game_State[roomIndex]) {
            
            // FR : On met à jour l'état de la bataille pour signaler qu'une bataille commence
            // EN : Update the battle state to indicate a battle has started
            Battle_Brawlers_Game_State[roomIndex].battleState = {
                ...Battle_Brawlers_Game_State[roomIndex].battleState, // on garde les autres propriétés
                battleInProcess: true,         // FR : une bataille est en cours | EN : a battle is in progress
                slot: slotWithTwoBakugans.id,  // FR : identifiant du slot où ça se passe | EN : id of the slot where it happens
                turns: 2,                      // FR : nombre de tours initialisés à 2 | EN : number of turns initialized to 2
                paused: false                  // FR : la bataille n'est pas en pause | EN : the battle is not paused
            }

            // FR : Mise à jour de l'état du tour :
            //      - on ne peut plus poser de nouveau Bakugan
            //      - on ne peut plus poser de nouvelle Gate Card
            //      - on peut utiliser une carte capacité
            //
            // EN : Update turn state:
            //      - no more placing new Bakugans
            //      - no more placing new Gate Cards
            //      - ability cards can now be used
            Battle_Brawlers_Game_State[roomIndex].turnState.set_new_bakugan = false
            Battle_Brawlers_Game_State[roomIndex].turnState.set_new_gate = false
            Battle_Brawlers_Game_State[roomIndex].turnState.use_ability_card = true

        } else {
            // FR : Si aucune condition n'est remplie, on sort simplement de la fonction
            // EN : If no condition is met, simply exit the function
            return
        }
    }
}
