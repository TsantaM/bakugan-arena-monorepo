import { AnimationDirectivesTypes, applyWinAbilitiesEffects, CheckBattle, ComeBackBakuganDirectiveAnimation, determineWinner, ElimineBakuganDirectiveAnimation, finalizeBattle, GateCards, GateCardsList, getPlayerDecksAndBakugans, GetUserName, updateDeckBakugans } from "@bakugan-arena/game-data"
import { Battle_Brawlers_Game_State } from "../game-state/battle-brawlers-game-state"


export const onBattleEnd = ({ roomId }: { roomId: string }) => {
    // FR: Récupération de la room ===
    // ENG Get the room from global game state ===
    const roomIndex = Battle_Brawlers_Game_State.findIndex((r) => r?.roomId === roomId)
    if (roomIndex === -1) return  // Si la room n'existe pas, on quitte
    // If room doesn't exist, exit

    const roomData = Battle_Brawlers_Game_State[roomIndex]
    if (!roomData) return  // Vérification supplémentaire (sûreté)
    // Additional safety check

    // FR: Vérification de l'état de la bataille ===
    // ENG Check battle state and players validity ===
    const { battleState, protalSlots, players, decksState } = roomData
    if (!battleState) return  // Pas d'état de bataille
    if (!battleState.battleInProcess || battleState.paused) return  // Si la bataille n'est pas active ou en pause, exit
    if (battleState.turns !== 0) return  // On ne traite la fin de bataille que pour le tour 0
    if (!players || players.length < 2) return  // Vérifie qu'il y a bien 2 joueurs
    // Only process if battle is active, not paused, and both players are present

    // FR: Récupération du slot de bataille actif ===
    // ENG Get the active battle slot ===
    const slot = protalSlots.find((s) => s.id === battleState.slot)
    if (!slot) return  // Vérifie que le slot existe et contient des bakugans
    if (slot.portalCard === null) return

    // FR: Activation de la carte portail avant l'élimination
    // ENG: Gate Card activation before elimination
    const card = GateCards[slot.portalCard.key]

    if (!slot.state.blocked && !slot.state.open && card.activeOnBattleEnd && card.activeOnBattleEnd.activeBeforeElimination && !card.activeOnBattleEnd.autoActiveOnEnd) {
        if (!battleState.slot) return
        const canAutoActivate = card.autoActivationCheck
            ? card.autoActivationCheck({ portalSlot: slot, roomState: roomData })
            : true

        if (canAutoActivate) {
            const animation: AnimationDirectivesTypes = {
                type: "OPEN_GATE_CARD",
                data: {
                    slot: structuredClone(slot),
                    slotId: structuredClone(slot).id
                },
                resolved: false,
                message: [{
                    text: `Gate Card Open ! ${card.name}`,
                    userName: GetUserName({ roomData: roomData, userId: slot.portalCard?.userId || '' }),
                    turn: roomData.turnState.turnCount
                },
                {
                    text: `${card.description}`,
                    turn: roomData.turnState.turnCount,
                    description: true
                }]
            }

            roomData.animations.push(animation)

            card.onOpen({ roomState: roomData, slot: battleState.slot })

            slot.state.open = true
        }

    }

    // FR: Récupération des IDs des joueurs ===
    // ENG Get player IDs ===
    const p1Id = players[0].userId
    const p2Id = players[1].userId

    // FR: Récupération des bakugans et decks des joueurs ===
    // ENG Get each player's bakugans and their deck ===
    const { player1Bakugans, p1Deck, player2Bakugans, p2Deck } = getPlayerDecksAndBakugans({ slot, decksState, players })
    if (player1Bakugans.length === 0 || player2Bakugans.length === 0) return  // Si un joueur n'a pas de bakugans, exit

    // FR: Calcul de la puissance totale de chaque joueur ===
    // ENG Calculate total power of each player's bakugans ===
    const sumCurrentPower = (arr: any[]) => arr.reduce((acc, b) => acc + (b?.currentPower ?? 0), 0)

    // FR: Récupération des clés des bakugans impliqués dans la bataille ===
    // ENG Get keys of all bakugans in this battle ===
    const keys = [...player1Bakugans.map((b) => ({ key: b.key, userId: b.userId })), ...player2Bakugans.map((b) => ({ key: b.key, userId: b.userId }))]

    // FR: Détermination du gagnant et du perdant ===
    // ENG Determine winner and loser ===
    const { isEquality, loser, winner } = determineWinner(
        sumCurrentPower(player1Bakugans),
        sumCurrentPower(player2Bakugans),
        p1Id,
        p2Id
    )

    // FR: Construction des tableaux winners et loosers
    // ENG: Build winners and losers arrays
    const winners: { key: string, userId: string }[] = []
    const loosers: { key: string, userId: string }[] = []

    slot.bakugans.forEach((bakugan) => {
        if (bakugan.userId === winner) {
            winners.push({
                key: bakugan.key,
                userId: bakugan.userId
            })
        }

        if (bakugan.userId === loser) {
            loosers.push({
                key: bakugan.key,
                userId: bakugan.userId
            })
        }
    })

    // FR: Récupération du deck du perdant ===
    // ENG Get the loser's deck ===
    const deckToUpdate = decksState.find((d) => d.userId === loser)

    // FR: Mise à jour des bakugans selon le résultat ===
    // ENG:  Update bakugans according to the result ===
    if (p1Deck && p2Deck) {
        if (!isEquality && winner && loser && deckToUpdate && deckToUpdate.bakugans) {

            slot.bakugans.forEach((bakugan) => {
                if (bakugan.userId === loser) {
                    ElimineBakuganDirectiveAnimation({
                        animations: roomData.animations,
                        bakugan: bakugan,
                        slot: slot,
                        turn: roomData.turnState.turnCount
                    })
                }
            })

            slot.bakugans.forEach((bakugan) => {
                if (bakugan.userId === winner) {
                    ComeBackBakuganDirectiveAnimation({
                        animations: roomData.animations,
                        bakugan: bakugan,
                        slot: slot
                    })
                }
            })

            // FR Si il y a un gagnant, appliquer les effets de victoire ===
            // ENG: Apply winner abilities effects ===
            applyWinAbilitiesEffects({ slot: slot, winner: winner, roomData: roomData })

            // FR Mettre à jour les bakugans : éliminer ceux du perdant et désactiver la présence sur le terrain ===
            // ENG: Update decks: eliminate loser's bakugans and remove onDomain flag from all involved bakugans ===
            updateDeckBakugans({ deck: deckToUpdate, bakugans: keys, eliminate: true })
            updateDeckBakugans({ deck: p1Deck, bakugans: keys })
            updateDeckBakugans({ deck: p2Deck, bakugans: keys })

            // FR: Finaliser la bataille ===
            //ENG: Finalize battle: reset slot, battle state, etc. ===
            finalizeBattle({ roomData, winnerId: winner, winners: winners, loserId: loser, loosers: loosers, slotToUpdate: slot })

        } else {
            // FR Si égalité, juste désactiver le flag onDomain ===
            // ENG: If equality, just reset onDomain for involved bakugans ===
            slot.bakugans.forEach((bakugan) => {
                ComeBackBakuganDirectiveAnimation({
                    animations: roomData.animations,
                    bakugan: bakugan,
                    slot: slot
                })
            })
            updateDeckBakugans({ deck: p1Deck, bakugans: keys })
            updateDeckBakugans({ deck: p2Deck, bakugans: keys })

            finalizeBattle({ roomData, slotToUpdate: slot })
        }
    }

    CheckBattle({ roomState: roomData })
}
