import { AnimationDirectivesTypes, GetUserName, setGateCardProps, stateType, updateDeckGates, updateSlot } from "@bakugan-arena/game-data"
import { Battle_Brawlers_Game_State } from "../game-state/battle-brawlers-game-state"
import { removeActionByType } from '@bakugan-arena/game-data/src/function/create-animation-directives/remove-action-by-type'
import { ActivePlayerActionRequestType, InactivePlayerActionRequestType } from "@bakugan-arena/game-data/src/type/actions-serveur-requests"


export const UpdateGate: ({ roomId, gateId, slot, userId }: setGateCardProps) => AnimationDirectivesTypes[] | undefined = ({ roomId, gateId, slot, userId }: setGateCardProps) => {
    // FR: Récupère l'état de la salle correspondant à l'ID
    // ENG: Retrieve the game room state matching the room ID
    const roomData = Battle_Brawlers_Game_State.find((room) => room?.roomId === roomId)

    // FR: Récupère l'index de la salle pour pouvoir remplacer son état dans le tableau global
    // ENG: Get the room index in order to replace its state in the global array
    const roomIndex = Battle_Brawlers_Game_State.findIndex((room) => room?.roomId === roomId)

    // FR: Si la salle n'existe pas ou que son index est invalide, on stoppe
    // ENG: If the room does not exist or has an invalid index, stop execution
    if (!roomData || roomIndex === -1) return

    // FR: Vérifie si le slot choisi est disponible pour poser une gate
    // ENG: Check if the selected slot is available to place a gate
    const usable_slot = roomData.protalSlots.find((s) => s.id === slot)?.can_set

    // FR: Vérifie si, selon l'état du tour, le joueur a le droit de poser une gate
    // ENG: Check if, according to the turn state, the player is allowed to place a gate
    const can_set_gate = roomData.turnState.set_new_gate

    // FR: Condition globale : le slot doit être libre, le tour doit permettre de poser une gate,
    // et le joueur ne doit pas être celui qui a joué au tour précédent
    // ENG: Global condition: slot must be free, the turn must allow gate placement,
    // and the player must not be the one who played the previous turn
    const notTurnAndTurn0 = roomData.turnState.previous_turn !== userId && roomData.turnState.turnCount > 0
    const canPlaceGate = usable_slot && can_set_gate && notTurnAndTurn0


    // // FR: Si les conditions ne sont pas réunies, on stoppe
    // // ENG: If conditions are not met, stop execution
    // if (!canPlaceGate) return
    // FR: Récupère le slot ciblé, le deck du joueur, et l'état du joueur
    // ENG: Retrieve the targeted slot, the player's deck, and the player's state
    const slotToUpdate = roomData.protalSlots.find((s) => s.id === slot)
    const deckToUpdate = roomData.decksState.find((s) => s.userId === userId)
    const newPlayerState = roomData.players.find((p) => p.userId === userId)

    // FR: Si une de ces entités est introuvable, on stoppe
    // ENG: If any of these entities are missing, stop execution
    if (!slotToUpdate || !deckToUpdate || !newPlayerState) return

    // FR: Nouveau slot : on bloque le placement (can_set = false) et on associe la gate au slot
    // ENG: New slot: disable further placement (can_set = false) and attach the gate to the slot
    const newSlotState = {
        ...slotToUpdate,
        can_set: false,
        portalCard: { key: gateId, userId }
    }

    // FR: Nouveau deck du joueur : met à jour les gates (la gate jouée devient "unusable")
    // ENG: New player deck: update the gates (the played gate becomes unusable)
    const newDeckState = {
        ...deckToUpdate,
        gates: updateDeckGates(deckToUpdate, gateId)
    }

    // FR: Construit le nouvel état complet de la salle avec toutes les mises à jour :
    // - joueurs (réduit usable_gates de 1)
    // - slots (ajout de la gate posée)
    // - deck du joueur (mise à jour des gates)
    // ENG: Build the complete new room state with all updates:
    // - players (decrease usable_gates by 1)
    // - slots (add the placed gate)
    // - player's deck (update gates)
    const state: stateType = {
        ...roomData,
        players: roomData.players.map((p) =>
            p.userId === newPlayerState.userId ? { ...p, usable_gates: p.usable_gates - 1 } : p
        ),
        protalSlots: updateSlot(roomData.protalSlots, slotToUpdate.id, newSlotState),
        decksState: roomData.decksState.map((d) =>
            d.userId === userId ? { ...d, gates: newDeckState.gates } : d
        )
    }

    // FR: Sauvegarde du nouvel état de la salle dans l'état global
    // ENG: Save the new room state back into the global state
    Battle_Brawlers_Game_State[roomIndex] = state

    return [{
        type: 'SET_GATE_CARD',
        data: {
            slot: newSlotState,
        },
        resolved: false,
        message: [{
            text: 'Gate Card Set !',
            userName: GetUserName({roomData: Battle_Brawlers_Game_State[roomIndex], userId: userId})
        }]
    }]
}
