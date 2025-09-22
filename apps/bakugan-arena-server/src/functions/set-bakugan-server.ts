import { BakuganList, bakuganOnSlot, portalSlotsType, setBakuganProps } from "@bakugan-arena/game-data"
import { Battle_Brawlers_Game_State } from "../game-state/battle-brawlers-game-state"

/**
 * Place a Bakugan on a portal slot in the room if all conditions are met.
 * 
 * Place un Bakugan sur un slot de portail si toutes les conditions sont remplies.
 */

export const SetBakuganOnGate = ({ roomId, bakuganKey, slot, userId }: setBakuganProps) => {

    // --- Find the current room by roomId / Récupérer la room actuelle par roomId

    const roomData = Battle_Brawlers_Game_State.find((room) => room?.roomId === roomId)
    const roomIndex = Battle_Brawlers_Game_State.findIndex((room) => room?.roomId === roomId)

    // --- Check if the target slot is usable (has a portal card)
    // Vérifie si le slot ciblé est utilisable (possède une carte portail)
    const usable_slot = roomData?.protalSlots.find((s) => s.id === slot)?.portalCard != null


    // --- All slots that are usable (have a portal card)
    // Tous les slots utilisables (avec une carte portail)
    const usable_slots = roomData?.protalSlots.filter((s) => s.portalCard != null)

    // --- Check if the player can set a new Bakugan this turn
    // Vérifie si le joueur peut poser un nouveau Bakugan ce tour-ci
    const can_set_bakugan = roomData?.turnState.set_new_bakugan

    // --- Count of Bakugan available to place (not on domain and not eliminated)
    // Nombre de Bakugan du joueur disponibles pour être posés (pas sur le domaine et pas éliminés)
    const usable_bakugan = roomData?.decksState.find((d) => d.userId === userId)?.bakugans.filter((b) => b?.bakuganData.onDomain === false && b?.bakuganData.elimined === false).length ?? 3
    const usersBakuganOnGate = roomData?.protalSlots.find((s) => s.id === slot)?.bakugans.filter((b) => b.userId === userId).length ?? 0;

    // --- Count of this user's Bakugan already on the target slot
    // Nombre de Bakugan du joueur déjà présents sur ce slot
    const slotsWithBakugans = roomData?.protalSlots.filter((s) => s.bakugans.length > 0 && s.portalCard !== null)


    // --- Main conditions to place a Bakugan
    // Conditions principales pour poser un Bakugan :
    // 1. Slot usable / Slot utilisable
    // 2. Player can place Bakugan this turn / Joueur peut poser un Bakugan
    // 3. Not the previous turn of this player / Pas le tour précédent du joueur
    // 4. Player has no Bakugan already on this slot / Aucun Bakugan du joueur sur ce slot
    if (usable_slot && can_set_bakugan && roomData.turnState.previous_turn != userId && usersBakuganOnGate < 1) {

        // --- Get the slot and deck to update / Récupère le slot et le deck à mettre à jour
        const slotToUpdate = roomData.protalSlots.find((s) => s.id === slot)
        const deckToUpdate = roomData.decksState.find((s) => s.userId === userId)

        // --- Get the selected Bakugan data from the deck / Récupère les données du Bakugan choisi depuis le deck
        const bakuganFromDeck = deckToUpdate?.bakugans.find((b) => b?.bakuganData.key === bakuganKey)?.bakuganData

        // --- Opponent's Bakugans / Bakugan de l'adversaire
        const opponentsBakugans = roomData?.decksState.find((d) => d.userId !== userId)?.bakugans
        const opponentsUsableBakugans = opponentsBakugans?.filter(
            (b) => b?.bakuganData.onDomain === false && b.bakuganData.elimined === false
        ).length ?? 0

        // --- Check if slot contains opponent's or user's Bakugan
        // Vérifie si le slot contient un Bakugan de l'adversaire ou du joueur
        const bakuganOpponent = slotToUpdate?.bakugans.some((b) => b.userId != userId)
        const bakuganUser = slotToUpdate?.bakugans.some((b) => b.userId === userId)

        // --- Get Bakugan data to add and current power level
        // Récupère le Bakugan à ajouter et sa puissance actuelle
        const bakuganToAdd = BakuganList.find((b) => b.key === bakuganKey)
        const powerLevel = bakuganFromDeck?.currentPowerLevel

        // --- Only proceed if slot, Bakugan, and conditions are valid
        // Ne continue que si slot, Bakugan et conditions sont valides
        if (slotToUpdate && bakuganToAdd && powerLevel && bakuganFromDeck.onDomain === false && bakuganFromDeck.elimined === false) {

            // --- Create new Bakugan object for the slot
            // Crée un nouvel objet Bakugan pour le slot
            const newBakugan: bakuganOnSlot = {
                key: bakuganToAdd.key,
                userId: userId,
                powerLevel: bakuganToAdd.powerLevel,
                currentPower: powerLevel,
                attribut: bakuganToAdd.attribut,
                image: bakuganToAdd.image,
                abilityBlock: false,
                assist: false
            }

            if (
                usable_bakugan === 1 &&
                usable_slots &&
                usable_slots.length > 1 &&
                slotsWithBakugans &&
                slotsWithBakugans.length > 0
            ) {

                // --- Last Bakugan must go on a slot with an opponent if opponent has none usable
                // Le dernier Bakugan doit aller sur un slot avec un adversaire si l'adversaire n'a plus de Bakugan jouables
                if (opponentsUsableBakugans === 0) {
                    // restriction : dernier bakugan doit aller sur un slot avec un adversaire
                    if (bakuganOpponent && !bakuganUser) {
                        if (!slotToUpdate?.bakugans.includes(newBakugan)) {
                            // --- Update deck and room state / Met à jour le deck et l'état de la room

                            const newDeckState: typeof bakuganFromDeck = {
                                ...bakuganFromDeck,
                                onDomain: true,
                            }

                            console.log(newDeckState)

                            const state: typeof roomData = {
                                ...roomData,
                                protalSlots: roomData.protalSlots.map((s) =>
                                    s.id === slotToUpdate.id
                                        ? {
                                            ...s,
                                            bakugans: [...s.bakugans, newBakugan],
                                        }
                                        : s
                                ),

                                decksState: roomData.decksState.map((d) =>
                                    d.userId === userId
                                        ? {
                                            ...d,
                                            bakugans: d.bakugans.map((b) =>
                                                b?.bakuganData.key === bakuganKey
                                                    ? {
                                                        ...b,
                                                        bakuganData: {
                                                            ...b.bakuganData,
                                                            onDomain: true,
                                                        },
                                                    }
                                                    : b
                                            ),
                                        }
                                        : d
                                ),
                            }

                            console.log(state)

                            if (roomIndex != -1) {
                                Battle_Brawlers_Game_State[roomIndex] = state
                            }
                        }
                    } else {
                        // Cannot place Bakugan here / Ne peut pas poser ici
                        return
                    }
                } else {
                    // Opponent still has usable Bakugan
                    // L'adversaire a encore des Bakugan → placement normal
                    if (!slotToUpdate?.bakugans.includes(newBakugan)) {
                        const newDeckState: typeof bakuganFromDeck = {
                            ...bakuganFromDeck,
                            onDomain: true,
                        }

                        console.log(newDeckState)

                        const state: typeof roomData = {
                            ...roomData,
                            protalSlots: roomData.protalSlots.map((s) =>
                                s.id === slotToUpdate.id
                                    ? {
                                        ...s,
                                        bakugans: [...s.bakugans, newBakugan],
                                    }
                                    : s
                            ),

                            decksState: roomData.decksState.map((d) =>
                                d.userId === userId
                                    ? {
                                        ...d,
                                        bakugans: d.bakugans.map((b) =>
                                            b?.bakuganData.key === bakuganKey
                                                ? {
                                                    ...b,
                                                    bakuganData: {
                                                        ...b.bakuganData,
                                                        onDomain: true,
                                                    },
                                                }
                                                : b
                                        ),
                                    }
                                    : d
                            ),
                        }

                        console.log(state)

                        if (roomIndex != -1) {
                            Battle_Brawlers_Game_State[roomIndex] = state
                        }
                    }
                }
            } else {
                // cas général (pas le dernier Bakugan) → logique normale
                if (!slotToUpdate?.bakugans.includes(newBakugan)) {
                    const newDeckState: typeof bakuganFromDeck = {
                        ...bakuganFromDeck,
                        onDomain: true,
                    }

                    console.log(newDeckState)

                    const state: typeof roomData = {
                        ...roomData,
                        protalSlots: roomData.protalSlots.map((s) =>
                            s.id === slotToUpdate.id
                                ? {
                                    ...s,
                                    bakugans: [...s.bakugans, newBakugan],
                                }
                                : s
                        ),

                        decksState: roomData.decksState.map((d) =>
                            d.userId === userId
                                ? {
                                    ...d,
                                    bakugans: d.bakugans.map((b) =>
                                        b?.bakuganData.key === bakuganKey
                                            ? {
                                                ...b,
                                                bakuganData: {
                                                    ...b.bakuganData,
                                                    onDomain: true,
                                                },
                                            }
                                            : b
                                    ),
                                }
                                : d
                        ),
                    }

                    console.log(state)

                    if (roomIndex != -1) {
                        Battle_Brawlers_Game_State[roomIndex] = state
                    }
                }
            }


        }



    }

}
