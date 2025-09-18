import { CheckBattle } from "../../function/check-battle-in-process";
import { abilityCardsType } from "../../type/game-data-types";
import { GateCardsList } from "../gate-gards";

export const CombatAerien: abilityCardsType = {
    key: 'combat-aerien',
    name: 'Combat Aérien',
    attribut: 'Ventus',
    description: `Permet à l'utilisateur de se déplacé vers une autre carte portail et l'empêche de s'ouvrir`,
    maxInDeck: 1,
    extraInputs: ["slot"],
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
                    slotTarget.bakugans.push(user)
                    slotTarget.state.blocked = true
                    slotOfGate.bakugans.splice(index, 1)
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
    extraInputs: ["slot"],
    onActivate: ({ roomState, userId, bakuganKey, slot, slot_to_move }) => {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate && slot_to_move !== '' && roomState) {
            const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)
            const opponent = slotOfGate.bakugans.find((b) => b.userId !== userId)
            const index = slotOfGate.bakugans.findIndex((ba) => ba.key === opponent?.key && ba.userId === opponent.userId)
            const slotTarget = roomState?.protalSlots.find((s) => s.id === slot_to_move)
            if (user && opponent && slotTarget && slotTarget.portalCard !== null) {
                slotTarget.bakugans.push(opponent)
                slotOfGate.bakugans.splice(index, 1)
                CheckBattle({ roomState })
                roomState.battleState.turns = 2
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
    onActivate: ({ roomState, userId, bakuganKey, slot }) => {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate) {
            const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)

            if (user) {
                user.currentPower += 100
            }
        }
    }
}