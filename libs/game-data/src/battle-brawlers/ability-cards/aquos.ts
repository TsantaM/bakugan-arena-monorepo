import { AbilityCardsActions, AnimationDirectivesTypes, slots_id, type abilityCardsType } from "../../type/type-index.js";
import { StandardCardsImages } from '../../store/store-index.js'
import { AbilityCardFailed, moveBakuganToSelectedSlot, PowerChangeDirectiveAnumation } from "../../function/index.js";
import { AbilityCardsList } from "../ability-cards.js";
import { ExclusiveAbilitiesList } from "../exclusive-abilities.js";
import { BakuganList } from "../bakugans.js";

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

        moveBakuganToSelectedSlot({ resolution: resolution, roomData: roomData, shouldBlockAlways: true })

    },
    activationConditions({ roomState, userId }) {
        if (!roomState) return false
        const slotWithGate = roomState.protalSlots.filter((slot) => slot.portalCard !== null)
        const opponentDeck = roomState.decksState.find((deck) => deck.userId !== userId)?.bakugans
        if (!opponentDeck) return false

        const opponentsBakugans = opponentDeck.filter((bakugan) => bakugan !== undefined && !bakugan?.bakuganData.onDomain && !bakugan?.bakuganData.elimined).length

        if (opponentsBakugans < 1) return false

        if (slotWithGate.length < 2) return false
        return true
    }
}

export const BarrageDeau: abilityCardsType = {
    key: `barrage-d'eau`,
    name: `Water Refrain`,
    maxInDeck: 1,
    attribut: 'Aquos',
    usable_in_neutral: true,
    image: StandardCardsImages.aquos,
    description: `This card prevents all players from using any abilities for 3 consecutive turns.`,
    onActivate: ({ roomState, userId, bakuganKey, slot }) => {
        if (!roomState) return null

        const user = roomState.protalSlots.find((s) => s.id === slot)?.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)

        if (!user) return null

        roomState.turnState.ability_card_block = {
            blocked: true,
            reason: {
                attribut: BarrageDeau.attribut ? BarrageDeau.attribut : "Aquos",
                bakugan: user,
                key: BarrageDeau.key,
                slot: slot
            },
            turn: 3
        }

        return null
    },
    onCanceled({ roomState }) {

        if (!roomState) return
        const { blocked, reason } = roomState.turnState.ability_card_block
        if (!blocked) return
        if (reason === null) return
        if (reason.attribut !== BarrageDeau.attribut) return
        if (reason.key !== BarrageDeau.key) return

        roomState.turnState.ability_card_block = {
            blocked: false,
            reason: null,
            turn: 0
        }

    },
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
    name: 'Deap Sea Dive',
    attribut: 'Aquos',
    maxInDeck: 1,
    usable_in_neutral: false,
    image: StandardCardsImages.aquos,
    description: `Transforme le terrain en aquos et empêche l'activation de toute carte maîtrise qui ne sont pas de l'attribut Aquos`,
    onActivate: ({ roomState, userId, bakuganKey, slot }) => {
        if (!roomState) return null
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate) {
            const AquosBakugans = slotOfGate.bakugans.filter((b) => b.attribut === "Aquos")
            const NotAquosBakugans = slotOfGate.bakugans.filter((b) => b.attribut !== "Aquos")

            AquosBakugans.forEach((bakugan) => {
                bakugan.currentPower += 100
                PowerChangeDirectiveAnumation({
                    animations: roomState.animations,
                    bakugans: [bakugan],
                    powerChange: 100,
                    turn: roomState.turnState.turnCount,
                    malus: false
                })
            })

            NotAquosBakugans.forEach((bakugan) => {
                bakugan.currentPower -= 100
                PowerChangeDirectiveAnumation({
                    animations: roomState.animations,
                    bakugans: [bakugan],
                    powerChange: 100,
                    turn: roomState.turnState.turnCount,
                    malus: true
                })
            })

            slotOfGate.activateAbilities.forEach((ability) => {
                if (ability.canceled) return
                const user = slotOfGate.bakugans.find((b) => b.key === ability.bakuganKey && b.userId === ability.userId)
                if (!user) return
                if (user.attribut === "Aquos") return
                const BakuganName = BakuganList.find((b) => b.key === user.key)?.name
                if(!BakuganName) return
                const abilityData = [...AbilityCardsList, ...ExclusiveAbilitiesList].find((card) => card.key === ability.key)
                if (!abilityData) return
                if (!abilityData.onCanceled) return

                const animation: AnimationDirectivesTypes = {
                    type: 'CANCEL_ABILITY_CARD',
                    data: {
                        card: ability.key,
                        attribut: user.attribut
                    },
                    message: [{
                        text: `${abilityData.name} of ${BakuganName} as been nullified !`,
                        turn: roomState?.turnState.turnCount
                    }],
                    resolve: false
                }

                roomState.animations.push(animation)

                abilityData.onCanceled({
                    bakuganKey: ability.bakuganKey,
                    roomState: roomState,
                    slot: slotOfGate.id,
                    userId: ability.userId
                })


            })
        }

        return null
    }
}