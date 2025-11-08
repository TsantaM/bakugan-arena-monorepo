import { CheckBattle } from "../../function/check-battle-in-process";
import { type abilityCardsType } from "../../type/game-data-types";
import type { bakuganOnSlot } from "../../type/room-types";
import { GateCardsList } from "../gate-gards";

export const CombatAerien: abilityCardsType = {
    key: 'combat-aerien',
    name: 'Combat Aérien',
    attribut: 'Ventus',
    description: `Permet à l'utilisateur de se déplacé vers une autre carte portail et l'empêche de s'ouvrir`,
    maxInDeck: 1,
    extraInputs: ["move-self"],
    usable_in_neutral: true,
    onActivate: ({ roomState, userId, bakuganKey, slot_to_move }) => {
        if (roomState && slot_to_move !== '') {
            const slotOfGate = roomState?.protalSlots.find((s) => s.bakugans.find((b) => b.key === bakuganKey && b.userId === userId))
            console.log(slotOfGate)
            const slotTarget = roomState?.protalSlots.find((s) => s.id === slot_to_move)
            console.log(slotTarget)
            if (slotOfGate && slotTarget && slotTarget.portalCard !== null) {
                const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)
                const index = slotOfGate.bakugans.findIndex((ba) => ba.key === user?.key && ba.userId === user.userId)
                if (user) {
                    const newUserState: bakuganOnSlot = {
                        ...user,
                        slot_id: slot_to_move
                    }
                    slotTarget.bakugans.push(newUserState)
                    slotTarget.state.blocked = true
                    slotOfGate.bakugans.splice(index, 1)

                    roomState.battleState.battleInProcess = false
                    roomState.battleState.paused = false
                    roomState.battleState.slot = null
                    roomState.battleState.turns = 2

                    CheckBattle({ roomState })
                }
            }
        }
    }
}

export const TornadeChaosTotal: abilityCardsType = {
    key: 'tornade-chaos-total',
    name: 'Tornade Chaos Total',
    maxInDeck: 1,
    attribut: 'Ventus',
    description: `Annule toutes les effets de la carte portail si elle est ouverte avant l'activation de cette capacité`,
    usable_in_neutral: false,
    onActivate: ({ roomState, userId, bakuganKey, slot }) => {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate) {
            const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)
            const gate = slotOfGate.portalCard?.key
            if (user && gate && slotOfGate.state.open) {
                const gateToCancel = GateCardsList.find((g) => g.key === gate)

                if (gateToCancel && gateToCancel.onCanceled) {
                    gateToCancel.onCanceled({ roomState, slot, userId: userId, bakuganKey: bakuganKey })
                    slotOfGate.state.canceled = true
                }

            }
        }
    }
}

export const SouffleTout: abilityCardsType = {
    key: 'souffle-tout',
    name: 'Souffle Tout',
    attribut: 'Ventus',
    description: `Permet d'envoyer le Bakugan adverse sur une autre carte portail`,
    maxInDeck: 3,
    extraInputs: ["move-opponent"],
    usable_in_neutral: false,
    onActivate: ({ roomState, userId, bakuganKey, slot, slot_to_move }) => {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate && slot_to_move !== '' && roomState) {
            const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)
            const opponent = slotOfGate.bakugans.find((b) => b.userId !== userId)
            const index = slotOfGate.bakugans.findIndex((ba) => ba.key === opponent?.key && ba.userId === opponent.userId)
            const slotTarget = roomState?.protalSlots.find((s) => s.id === slot_to_move)
            if (user && opponent && slotTarget && slotTarget.portalCard !== null) {

                const newOpponentState: bakuganOnSlot = {
                    ...opponent,
                    slot_id: slot_to_move
                }

                slotTarget.bakugans.push(newOpponentState)
                slotOfGate.bakugans.splice(index, 1)

                roomState.battleState.battleInProcess = false
                roomState.battleState.paused = false
                roomState.battleState.slot = null
                roomState.battleState.turns = 2

                CheckBattle({ roomState })
                if (!roomState.battleState.battleInProcess) {
                    roomState.battleState.turns = 2
                    roomState.turnState = {
                        ...roomState.turnState,
                        set_new_bakugan: true,
                        set_new_gate: true,
                        use_ability_card: true
                    }
                }
            }
        }
    }
}

export const RetourDair: abilityCardsType = {
    key: 'retour-d-air',
    name: `Retour d'Air`,
    attribut: 'Ventus',
    maxInDeck: 1,
    description: `Permet à l'utilisateur de se retirer du combat`,
    usable_in_neutral: true,
    onActivate: ({ roomState, userId, bakuganKey, slot }) => {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate && roomState) {
            const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)
            const index = slotOfGate.bakugans.findIndex((ba) => ba.key === user?.key && ba.userId === user.userId)
            const bakuganInDeck = roomState?.decksState.find((d) => d.userId === userId)?.bakugans.find((b) => b?.bakuganData.key === bakuganKey)

            if (user && bakuganInDeck) {
                slotOfGate.bakugans.splice(index, 1)
                bakuganInDeck.bakuganData.onDomain = false
            }

            roomState.battleState.battleInProcess = false
            roomState.battleState.slot = null
            roomState.battleState.paused = false
        }
    }
}

export const TornadeExtreme: abilityCardsType = {
    key: 'tornade-extreme',
    name: 'Tornade Extreme',
    attribut: 'Ventus',
    description: `Permet à l'utilisateur d'attirer un Bakugan sur la carte portail où il se trouve`,
    maxInDeck: 1,
    extraInputs: ['drag-bakugan'],
    usable_in_neutral: true,
    onActivate: ({ roomState, userId, bakuganKey, slot, target, slotToDrag }) => {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        const slotTarget = roomState?.protalSlots.find((s) => s.id === slotToDrag)
        console.log(target, slotToDrag, slot)
        console.log(slotOfGate)
        // const targetToDrag = slotTarget?.bakugans.find((b) => b.key === target)
        if (slotOfGate && slotTarget && target !== '' && slotToDrag !== '') {
            const BakuganTargetIndex = slotTarget.bakugans.findIndex((b) => b.key === target)
            const bakuganToDrag = slotTarget?.bakugans.find((b) => b.key === target)
            const condition = slotOfGate && slotTarget && bakuganToDrag && BakuganTargetIndex ? true : false

            console.log(slotTarget)
            console.log(bakuganToDrag)
            console.log(BakuganTargetIndex)
            console.log(condition)

            const user = slotOfGate?.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)

            if (user && bakuganToDrag) {

                const newState: bakuganOnSlot = {
                    ...bakuganToDrag,
                    slot_id: slot
                }

                slotOfGate.bakugans.push(newState)
                slotTarget.bakugans.splice(BakuganTargetIndex, 1)
                CheckBattle({ roomState })
            }
        }

    }
}