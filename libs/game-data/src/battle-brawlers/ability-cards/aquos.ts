import { type abilityCardsType } from "../../type/game-data-types";
import type { AbilityCardsActions } from "../../type/actions-serveur-requests";
import { StandardCardsImages } from '../../store/ability-cards-images'
import { MoveToAnotherSlotDirectiveAnimation } from "../../function/create-animation-directives/move-to-another-slot";
import { bakuganOnSlot, slots_id } from "../../type/room-types";
import { OpenGateCardActionRequest } from "../../function/action-request-functions/open-gate-card-action-request";
import { CheckBattleStillInProcess } from "../../function/check-battle-still-in-process";

export const MirageAquatique: abilityCardsType = {
    key: 'mirage-aquatique',
    name: 'Mirage Aquatique',
    attribut: 'Aquos',
    description: `'Permet à l'utilisateur de se déplacer vers une autre carte portail et l'empêche de s'ouvrir`,
    maxInDeck: 2,
    extraInputs: ["move-self"],
    usable_in_neutral: true,
    image: 'mirage-aquatique.jpg',
    onActivate: ({ roomState, userId, bakuganKey, slot }) => {

        if (!roomState) return null

        const opponentsUsableBakugans = roomState.decksState.find((deck) => deck.userId !== userId)?.bakugans.filter((deck) => !deck?.bakuganData.elimined && !deck?.bakuganData.onDomain)
        const opponentBakugansOnField = roomState.protalSlots.map((slot) => slot.bakugans).flat().filter((bakugan) => bakugan.slot_id !== slot && bakugan.userId !== userId)

        if ((opponentsUsableBakugans && opponentsUsableBakugans.length === 0 && opponentBakugansOnField.length === 0)) return null

        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        const deck = roomState?.decksState.find((d) => d.userId === userId)
        const userData = slotOfGate?.bakugans.find((bakugan) => bakugan.key === bakuganKey && bakugan.userId === userId)

        if (!slotOfGate && !deck && !userData) return null

        const slots: slots_id[] = opponentsUsableBakugans && opponentsUsableBakugans.length === 0 && opponentBakugansOnField.length > 0 ? opponentBakugansOnField.map((bakugan) => bakugan.slot_id) : roomState.protalSlots.filter((s) => s.portalCard !== null && s.id !== slot).map((slot) => slot.id)

        if (slots.length <= 0) return null

        const request: AbilityCardsActions = {
            type: 'SELECT_SLOT',
            message: 'Mirage Aquatique : Choisissez le slot de déstination',
            slots: slots
        }

        return request

    },
    onAdditionalEffect: ({ resolution, roomData }) => {

        if (!roomData) return
        if (resolution.data.type !== 'SELECT_SLOT') return
        const destination = resolution.data.slot
        const slotOfGate = roomData.protalSlots.find((s) => s.bakugans.find((b) => b.key === resolution.bakuganKey && b.userId === resolution.userId))
        console.log(slotOfGate)
        const slotTarget = roomData.protalSlots.find((s) => s.id === destination)
        console.log(slotTarget)
        if (slotOfGate && slotTarget && slotTarget.portalCard !== null) {
            const user = slotOfGate.bakugans.find((b) => b.key === resolution.bakuganKey && b.userId === resolution.userId)
            const index = slotOfGate.bakugans.findIndex((ba) => ba.key === user?.key && ba.userId === user.userId)
            if (user) {
                const newUserState: bakuganOnSlot = {
                    ...user,
                    slot_id: destination
                }
                slotTarget.bakugans.push(newUserState)
                slotTarget.state.blocked = true
                slotOfGate.bakugans.splice(index, 1)

                MoveToAnotherSlotDirectiveAnimation({
                    animations: roomData.animations,
                    bakugan: user,
                    initialSlot: structuredClone(slotOfGate),
                    newSlot: structuredClone(slotTarget)
                })

                CheckBattleStillInProcess(roomData)
                OpenGateCardActionRequest({ roomState: roomData })

                return {
                    turnActionLaucher: true
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
    image: StandardCardsImages.aquos,
    description: `Empêche l'activation de toute capacité sur le domaine pendant 3 tours`,
    onActivate: ({ roomState, userId, bakuganKey, slot }) => {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate) {
            const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)

            if (user) {
                user.currentPower += 100
            }
        }
        return null
    }
}

export const BouclierAquos: abilityCardsType = {
    key: 'bouclier-aquos',
    attribut: 'Aquos',
    description: 'Protège contre toute capacité adverse pendant le tour',
    maxInDeck: 2,
    name: 'Bouclier Aquos',
    image: StandardCardsImages.aquos,
    usable_in_neutral: false,
    onActivate: ({ roomState, userId, bakuganKey, slot }) => {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate) {
            const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)

            if (user) {
                user.currentPower += 100
            }
        }

        return null
    }
}

export const PlongeeEnEauProfonde: abilityCardsType = {
    key: 'plongee-en-eau-profonde',
    name: 'Plongée en Eau Profonde',
    attribut: 'Aquos',
    maxInDeck: 1,
    usable_in_neutral: false,
    image: StandardCardsImages.aquos,
    description: `Transforme le terrain en aquos et empêche l'activation de toute carte maîtrise qui ne sont pas de l'attribut Aquos`,
    onActivate: ({ roomState, userId, bakuganKey, slot }) => {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate) {
            const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)

            if (user) {
                user.currentPower += 100
            }
        }

        return null
    }
}