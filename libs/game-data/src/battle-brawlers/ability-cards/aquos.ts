import { AbilityCardsActions, slots_id, type abilityCardsType } from "../../type/type-index.js";
import { StandardCardsImages } from '../../store/store-index.js'
import { AbilityCardFailed, moveBakuganToSelectedSlot } from "../../function/index.js";

export const MirageAquatique: abilityCardsType = {
    key: 'mirage-aquatique',
    name: 'Dive Mirage',
    attribut: 'Aquos',
    description: `Move an Aquos Bakugan from one gate card to another, also it prevents the opponent's gate card from opening`,
    maxInDeck: 2,
    extraInputs: ["move-self"],
    usable_in_neutral: true,
    image: 'mirage-aquatique.jpg',
    onActivate: ({ roomState, userId, bakuganKey, slot }) => {
        const animation = AbilityCardFailed({ card: MirageAquatique.name })

        if (!roomState) return animation

        if (MirageAquatique.activationConditions) {
            const checker = MirageAquatique.activationConditions({ roomState, userId })
            if (checker === false) return animation
        }


        const opponentsUsableBakugans = roomState.decksState.find((deck) => deck.userId !== userId)?.bakugans.filter((deck) => !deck?.bakuganData.elimined && !deck?.bakuganData.onDomain)
        const opponentBakugansOnField = roomState.protalSlots.map((slot) => slot.bakugans).flat().filter((bakugan) => bakugan.slot_id !== slot && bakugan.userId !== userId)

        if ((opponentsUsableBakugans && opponentsUsableBakugans.length === 0 && opponentBakugansOnField.length === 0)) return animation

        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        const deck = roomState?.decksState.find((d) => d.userId === userId)
        const userData = slotOfGate?.bakugans.find((bakugan) => bakugan.key === bakuganKey && bakugan.userId === userId)

        if (!slotOfGate && !deck && !userData) return animation

        const slots: slots_id[] = opponentsUsableBakugans && opponentsUsableBakugans.length === 0 && opponentBakugansOnField.length > 0 ? opponentBakugansOnField.map((bakugan) => bakugan.slot_id) : roomState.protalSlots.filter((s) => s.portalCard !== null && s.id !== slot).map((slot) => slot.id)

        if (slots.length <= 0) return animation

        const request: AbilityCardsActions = {
            type: 'SELECT_SLOT',
            message: 'Dive Mirage : Select a slot',
            slots: slots
        }

        return request

    },
    onAdditionalEffect: ({ resolution, roomData }) => {

        moveBakuganToSelectedSlot({ resolution: resolution, roomData: roomData, shouldBlockAlways: true})

    },
    activationConditions({roomState, userId}) {
        if(!roomState) return false
        const slotWithGate = roomState.protalSlots.filter((slot) => slot.portalCard !== null)
        const opponentDeck = roomState.decksState.find((deck) => deck.userId !== userId)?.bakugans
        if(!opponentDeck) return false

        const opponentsBakugans = opponentDeck.filter((bakugan) => bakugan !== undefined && !bakugan?.bakuganData.onDomain && !bakugan?.bakuganData.elimined).length

        if(opponentsBakugans < 1) return false

        if(slotWithGate.length < 2) return false
        return true
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