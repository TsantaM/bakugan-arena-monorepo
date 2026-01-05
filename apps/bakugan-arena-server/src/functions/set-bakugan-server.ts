import { addBakuganToSlot, AnimationDirectivesTypes, BakuganList, GetUserName, setBakuganProps, Slots, slots_id } from "@bakugan-arena/game-data"
import { Battle_Brawlers_Game_State } from "../game-state/battle-brawlers-game-state"

export const SetBakuganOnGate = ({ roomId, bakuganKey, slot, userId }: setBakuganProps): AnimationDirectivesTypes[] | undefined => {

    // FR: Récupération de la room actuelle par son ID
    // ENG Get the current room by its ID
    const roomData = Battle_Brawlers_Game_State.find((room) => room?.roomId === roomId)

    // FR: Index de la room dans l'état global pour mise à jour
    // ENG Index of the room in the global state for updating
    const roomIndex = Battle_Brawlers_Game_State.findIndex((room) => room?.roomId === roomId)

    // FR: Nombre de Bakugan du joueur disponibles pour être posés (pas sur le domaine, pas éliminés)
    // ENG Number of the player's Bakugan available to be placed (not on the domain, not eliminated)
    const usable_bakugan = roomData?.decksState
        .find((d) => d.userId === userId)
        ?.bakugans.filter((b) => b?.bakuganData.onDomain === false && b?.bakuganData.elimined === false)
        .length ?? 3

    // FR: Nombre de Bakugan du joueur déjà présents sur le slot ciblé
    // ENG Number of the player's Bakugan already on the target slot
    const usersBakuganOnGate = roomData?.protalSlots
        .find((s) => s.id === slot)
        ?.bakugans.filter((b) => b.userId === userId).length ?? 0

    // FR: Récupération du slot ciblé
    // ENG Get the target slot
    const slotToUpdate = roomData?.protalSlots.find((s) => s.id === slot)

    // FR: Vérifie si le slot est utilisable (possède une carte portail)
    // ENG Check if the slot is usable (has a portal card)
    const isSlotUsable = slotToUpdate?.portalCard != null

    // FR: Vérifie si le joueur peut poser un Bakugan ce tour
    // ENG Check if the player can place a Bakugan this turn
    const canPlayerSetBakugan = roomData?.turnState.set_new_bakugan

    // FR: Vérifie si ce n'est pas le tour précédent du joueur
    // ENG Check if it's not the previous turn of this player
    const isNotPreviousTurn = roomData?.turnState.previous_turn !== userId

    // FR: Vérifie si le joueur n'a pas déjà de Bakugan sur ce slot
    // ENG Check if the player has no Bakugan on this slot
    const hasNoBakuganOnSlot = usersBakuganOnGate < 1

    // FR: Vérifie si toutes les conditions pour poser un Bakugan sont remplies
    // ENG Check if all conditions to place a Bakugan are met
    const canPlaceBakugan = isSlotUsable && canPlayerSetBakugan && isNotPreviousTurn && hasNoBakuganOnSlot

    if (!canPlaceBakugan) return

    // FR: Récupération du deck du joueur
    // ENG Get the player's deck
    const deckToUpdate = roomData.decksState.find((s) => s.userId === userId)

    // FR: Récupération des données du Bakugan choisi depuis le deck
    // ENG Get the selected Bakugan data from the deck
    const bakuganFromDeck = deckToUpdate?.bakugans.find((b) => b?.bakuganData.key === bakuganKey)?.bakuganData

    // FR: Récupération des données générales du Bakugan à partir de la liste globale
    // ENG Get the general Bakugan data from the global list
    const bakuganToAdd = BakuganList.find((b) => b.key === bakuganKey)

    if (!bakuganFromDeck || !bakuganToAdd) return

    // FR: Récupération des Bakugan de l'adversaire
    // ENG Get the opponent's Bakugan
    const opponentsBakugans = roomData?.decksState.find((d) => d.userId !== userId)?.bakugans

    // FR: Nombre de Bakugan jouables de l'adversaire (pas sur le domaine, pas éliminés)
    // ENG Number of usable opponent Bakugan (not on domain, not eliminated)
    const opponentsUsableBakugans = opponentsBakugans?.filter(
        (b) => b?.bakuganData.onDomain === false && b.bakuganData.elimined === false
    ).length ?? 0

    // FR: Vérifie si le slot contient un Bakugan adverse
    // ENG Check if the slot contains an opponent's Bakugan
    const slotHasOpponentBakugan = slotToUpdate?.bakugans.some((b) => b.userId !== userId)

    // FR: Vérifie si le slot contient un Bakugan du joueur
    // ENG Check if the slot contains a player's Bakugan
    const slotHasUserBakugan = slotToUpdate?.bakugans.some((b) => b.userId === userId)

    // FR: Vérifie si c'est le dernier Bakugan du joueur à poser
    // ENG Check if this is the player's last Bakugan to place
    const isLastBakugan = usable_bakugan === 1

    // FR: Vérifie si l'adversaire a encore des Bakugan jouables
    // ENG Check if the opponent still has usable Bakugan
    const opponentHasUsableBakugan = opponentsUsableBakugans > 0

    // FR: Calcul du flag pour savoir si on peut placer le Bakugan sur ce slot
    // ENG Calculate the flag to know if the Bakugan can be placed on this slot
    const canPlace = !isLastBakugan || (isLastBakugan && (
        !opponentHasUsableBakugan
            ? slotHasOpponentBakugan && !slotHasUserBakugan
            : opponentHasUsableBakugan
    ))

    if (!canPlace) return

    // FR: Placement du Bakugan sur le slot via la fonction utilitaire
    // ENG Place the Bakugan on the slot using the utility function
    Battle_Brawlers_Game_State[roomIndex] = addBakuganToSlot({
        bakuganFromDeck,
        bakuganToAdd,
        roomData,
        slotId: slot as slots_id,
        userId
    })

    const slots = Battle_Brawlers_Game_State[roomIndex]?.protalSlots

    if (!slots) return
    const bakugan = slots[Slots.indexOf(slot as slots_id)].bakugans.find((b) => b.key === bakuganKey && b.userId === userId)
    if (!bakugan) return
    const animation: AnimationDirectivesTypes = {
        type: 'SET_BAKUGAN',
        data: {
            bakugan: bakugan,
            slot: structuredClone(slots[Slots.indexOf(slot as slots_id)]),
        },
        resolved: false,
        message: [{
            text: `Bakugan au combat !`,
            userName: GetUserName({roomData: Battle_Brawlers_Game_State[roomIndex], userId: userId})
        }, {
            text: `${bakuganToAdd.name} transformation !`,
            userName: GetUserName({roomData: Battle_Brawlers_Game_State[roomIndex], userId: userId})
        }]
    }
    // Battle_Brawlers_Game_State[roomIndex]?.animations.push(animation)

    return [animation]
}
