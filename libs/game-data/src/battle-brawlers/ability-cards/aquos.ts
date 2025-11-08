import { CheckBattle } from "../../function/check-battle-in-process";
import { type abilityCardsType } from "../../type/game-data-types";
import type { bakuganOnSlot } from "../../type/room-types";

export const MirageAquatique: abilityCardsType = {
    key: 'mirage-aquatique',
    name: 'Mirage Aquatique',
    attribut: 'Aquos',
    description: `'Permet à l'utilisateur de se déplacer vers une autre carte portail et l'empêche de s'ouvrir`,
    maxInDeck: 2,
    extraInputs: ["move-self"],
    usable_in_neutral: true,
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

export const BarrageDeau: abilityCardsType = {
    key: `barrage-d'eau`,
    name: `Barrage d'Eau`,
    maxInDeck: 1,
    attribut: 'Aquos',
    usable_in_neutral: true,
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
    usable_in_neutral: false,
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
    usable_in_neutral: false,
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