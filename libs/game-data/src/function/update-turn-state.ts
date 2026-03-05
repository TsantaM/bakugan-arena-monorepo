import { AbilityCardsList } from "../battle-brawlers/ability-cards.js";
import { ExclusiveAbilitiesList } from "../battle-brawlers/exclusive-abilities.js";
import { AnimationDirectivesTypes, type stateType } from "../type/type-index.js";

export function updateTurnState(roomData: stateType) {
    if (!roomData) return

    const { turnState, decksState, protalSlots } = roomData

    // Incrément du compteur de tours
    turnState.turnCount++

    // Détermination du joueur qui joue
    const players = decksState.map(d => d.userId)
    if (turnState.can_change_player_turn === true) {
        turnState.previous_turn = turnState.turn
        turnState.turn = players.find(p => p !== turnState.turn) ?? turnState.turn
    }

    turnState.can_change_player_turn = true

    // Règles selon le nombre de tours
    if (turnState.turnCount > 0) {
        turnState.set_new_bakugan = true
        turnState.use_ability_card = true
        protalSlots.forEach(p => {
            if (!p.can_set && !p.portalCard) p.can_set = true
        })
    }

    if (turnState.ability_card_block.blocked === true) {

        const { blocked, turn, reason } = turnState.ability_card_block

        function AddAnimation() {
            if (!roomData) return
            const card = [...AbilityCardsList, ...ExclusiveAbilitiesList].find((c) => c.key === reason?.key)
            if (card) {
                if (!reason) return
                const animation: AnimationDirectivesTypes = {
                    type: 'CANCEL_ABILITY_CARD',
                    data: {
                        attribut: reason.attribut,
                        card: reason.key
                    },
                    message: [
                        {
                            turn: roomData.turnState.turnCount,
                            text: `${card.name} nullified !`
                        }
                    ],
                    resolve: false
                }

                roomData.animations.push(animation)
            }
        }


        if (turn > 0 && turnState.ability_card_block.blocked) {
            turnState.ability_card_block.turn = turnState.ability_card_block.turn--
        } else {

            AddAnimation()

            turnState.ability_card_block.blocked = false
            turnState.ability_card_block.reason = null
            turnState.ability_card_block.turn = 0
        }

        if (blocked && turn === 0) {

            AddAnimation()

            turnState.ability_card_block.blocked = false
            turnState.ability_card_block.reason = null
            turnState.ability_card_block.turn = 0
        }
    }

}