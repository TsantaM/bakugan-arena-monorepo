import { AbilityCardsList, ExclusiveAbilitiesList, useAbilityCardProps } from "@bakugan-arena/game-data";
import { Battle_Brawlers_Game_State } from "../game-state/battle-brawlers-game-state";
import { activateAbilities } from "@bakugan-arena/game-data/src/type/room-types";

export const useAbilityCardServer = ({ roomId, abilityId, slot, userId, bakuganKey, target_slot, slot_to_move, target, slotToDrag, bakuganToAdd, bakuganToMove, destination }: useAbilityCardProps) => {
    // FR: On récupère les données de la salle en cours avec son roomId
    // ENG: Get the current room data using the roomId
    const roomData = Battle_Brawlers_Game_State.find((room) => room?.roomId === roomId)

    // FR: On récupère l'index de la salle pour pouvoir la modifier directement dans le tableau global
    // ENG: Get the room index to update the global state array directly
    const roomIndex = Battle_Brawlers_Game_State.findIndex((room) => room?.roomId === roomId)

    // FR: Liste complète des capacités disponibles (générales + exclusives)
    // ENG: Full list of available abilities (general + exclusive)
    const abilities = [...AbilityCardsList, ...ExclusiveAbilitiesList]

    // FR: On cherche la capacité que le joueur veut utiliser (via abilityId)
    // ENG: Find the ability the player wants to use (by abilityId)
    const abilityToUse = abilities.find((a) => a.key === abilityId)

    // FR: On récupère le nombre d’aptitudes encore utilisables par le joueur
    // ENG: Get how many ability cards the player can still use
    const playerAbilities = roomData?.players.find((p) => p.userId === userId)?.usable_abilitys

    // FR: On récupère l’emplacement (slot) concerné par l’action
    // ENG: Get the slot object where the action is happening
    const slotObj = Battle_Brawlers_Game_State[roomIndex]?.protalSlots.find((s) => s.id === slot)

    // FR: On vérifie que le Bakugan de l’utilisateur est bien présent sur le slot et correspond à la clé fournie
    // ENG: Check that the player’s Bakugan is on the slot and matches the given key
    const abilityUser = slotObj?.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)

    console.log(target, slotToDrag)

    // --- CONDITIONS D'ACTIVATION ---
    // FR: On exécute l’activation SEULEMENT SI :
    //   1. La salle existe (roomData)
    //   2. La capacité existe (abilityToUse)
    //   3. Le joueur a encore des capacités disponibles (playerAbilities > 0)
    //   4. Le Bakugan est bien présent et appartient à l’utilisateur (abilityUser)
    //   5. Le Bakugan n’a pas de blocage de capacité (abilityUser.abilityBlock === false)
    //
    // ENG: Ability can only be activated IF:
    //   1. The room exists (roomData)
    //   2. The ability exists (abilityToUse)
    //   3. The player still has usable abilities (playerAbilities > 0)
    //   4. The Bakugan is present and belongs to the user (abilityUser)
    //   5. The Bakugan is not blocked from using abilities (abilityUser.abilityBlock === false)
    if (roomData && abilityToUse && playerAbilities && playerAbilities > 0 && abilityUser && !abilityUser.abilityBlock) {
        
        // FR: On exécute l’effet de la capacité en lui passant tout le contexte nécessaire
        // ENG: Execute the ability effect by passing all required context
        abilityToUse.onActivate({ roomState: roomData, roomId: roomId, bakuganKey: bakuganKey, slot: slot, userId: userId, target_slot: target_slot, slot_to_move: slot_to_move, target: target, slotToDrag: slotToDrag, bakuganToAdd: bakuganToAdd, bakuganToMove: bakuganToMove, destination: destination })

        // --- ENREGISTREMENT DE L'ACTIVATION ---
        if (slotObj) {
            // FR: On calcule un nouvel ID unique pour l’activation
            // ENG: Generate a new unique ID for the activation
            const abilities = slotObj.activateAbilities
            const lastId = abilities.length > 0 ? abilities[abilities.length - 1].id : 0
            const newId = lastId + 1

            // FR: On prépare l’objet représentant la capacité activée
            // ENG: Create a new activation object for the ability
            const newAbilityToPush: activateAbilities = {
                id: newId, // FR: Toujours supérieur au précédent / ENG: Always greater than the last one
                bakuganKey: bakuganKey,
                canceled: false,
                key: abilityId,
                userId: userId
            }

            // FR: On ajoute la nouvelle activation dans la liste des capacités actives du slot
            // ENG: Push the new activation into the slot’s active abilities list
            Battle_Brawlers_Game_State[roomIndex]?.protalSlots.find((s) => s.id === slot)?.activateAbilities.push(newAbilityToPush)
        }

        // --- MARQUER LA CARTE COMME UTILISÉE ---
        // FR: Vérifie si la carte capacité "classique" du joueur est encore non-utilisée
        // ENG: Check if the player’s normal ability card is still unused
        const abilityCardUsed = roomData.decksState.find((d) => d.userId === userId)?.abilities.find((a) => a.key === abilityId && a.used === false)

        // FR: Vérifie si c’est une carte exclusive liée au Bakugan
        // ENG: Check if it is an exclusive ability tied to the Bakugan
        const exclusiveCardUsed = roomData.decksState.find((d) => d.userId === userId)?.bakugans.find((b) => b?.bakuganData.key === bakuganKey && b.excluAbilitiesState.find((e) => e.key === abilityId && e.used === false))?.excluAbilitiesState

        if (abilityCardUsed) {
            // FR: Marquer la carte capacité comme utilisée
            // ENG: Mark the ability card as used
            abilityCardUsed.used = true
        }

        if (exclusiveCardUsed) {
            // FR: Marquer la carte exclusive comme utilisée
            // ENG: Mark the exclusive card as used
            exclusiveCardUsed[0].used = true
        }

        // --- MISE À JOUR DE L’ÉTAT GLOBAL ---
        // FR: On réduit le nombre de capacités disponibles pour le joueur
        // ENG: Decrease the number of usable abilities for the player
        const state: typeof roomData = {
            ...roomData,
            players: roomData.players.map((p) => p.userId === userId ? {
                ...p,
                usable_abilitys: p.usable_abilitys - 1
            } : p),
        }

        // FR: Sauvegarde du nouvel état de la salle dans l'état global
        // ENG: Save the new room state back into the global state
        Battle_Brawlers_Game_State[roomIndex] = state
    }
}