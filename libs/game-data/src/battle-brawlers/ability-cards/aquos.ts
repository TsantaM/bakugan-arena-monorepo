import { CheckBattle } from "../../function/check-battle-in-process";
import { abilityCardsType } from "../../type/game-data-types";

export const MirageAquatique: abilityCardsType = {
    key: 'mirage-aquatique',
    name: 'Mirage Aquatique',
    attribut: 'Aquos',
    description: `'Permet à l'utilisateur de se déplacer vers une autre carte portail et l'empêche de s'ouvrir`,
    maxInDeck: 2,
    extraInputs: ["slot"],
    onActivate: ({ roomState, userId, bakuganKey, slot_to_move }) => {
        console.log(slot_to_move)
        if (roomState && slot_to_move !== '' && roomState) {
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
                    roomState.battleState.turns = 2
                }
            }
        }
    }
}

export const BarrageDeau: abilityCardsType = {
    key: `barrage-d'eau`,
    name: `Barrage d'Eau`,
    maxInDeck: 1,
    attribut: 'Aquos',
    description: `Empêche l'activation de toute capacité sur le domaine pendant 3 tours`,
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

export const BouclierAquos: abilityCardsType = {
    key: 'bouclier-aquos',
    attribut: 'Aquos',
    description: 'Protège contre toute capacité adverse pendant le tour',
    maxInDeck: 2,
    name: 'Bouclier Aquos',
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

export const PlongeeEnEauProfonde: abilityCardsType = {
    key: 'plongee-en-eau-profonde',
    name: 'Plongée en Eau Profonde',
    attribut: 'Aquos',
    maxInDeck: 1,
    description: `Transforme le terrain en aquos et empêche l'activation de toute carte maîtrise qui ne sont pas de l'attribut Aquos`,
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