import { PowerChangeDirectiveAnumation } from "../../function/create-animation-directives/power-change";
import { type abilityCardsType } from "../../type/game-data-types";
import { GateCardsList } from "../gate-gards";
import { ComeBackBakuganDirectiveAnimation } from "../../function/create-animation-directives/come-back-bakugan";
import { CancelGateCardDirectiveAnimation } from "../../function/create-animation-directives/cancel-gate-card";
import type { AbilityCardsActions } from "../../type/actions-serveur-requests";
import { StandardCardsImages } from "../../store/ability-cards-images";
import { SetBakuganAndAddRenfortAnimationDirective } from "../../function/create-animation-directives/add-renfort-directive";
import type { bakuganOnSlot } from "../../type/room-types";

export const MurDeFeu: abilityCardsType = {
    key: "mur-de-feu",
    name: "Mur de Feu",
    attribut: "Pyrus",
    description: "Retire 50 G aux bakugans adverses",
    maxInDeck: 3,
    usable_in_neutral: false,
    image: StandardCardsImages.pyrus,
    onActivate: ({ roomState, userId, bakuganKey, slot }) => {
        if (!roomState) return null
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)

        if (slotOfGate) {
            const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)
            const opponents = slotOfGate.bakugans.filter((b) => b.userId !== userId)
            if (user) {
                opponents.forEach((b) => {
                    b.currentPower -= 50
                }
                )
            }
            PowerChangeDirectiveAnumation({
                animations: roomState.animations,
                bakugans: opponents,
                powerChange: 50,
                malus: true
            })
        }

        return null
    },
}

export const JetEnflamme: abilityCardsType = {
    key: 'jet-enflamme',
    name: 'Jet Enflammé',
    attribut: 'Pyrus',
    maxInDeck: 1,
    description: `Permet d'ajouter un bakugan en plus au combat s'il y a déjà au moins un Bakugan Pyrus sur le terrain`,
    extraInputs: ['add-bakugan'],
    image: StandardCardsImages.pyrus,
    usable_in_neutral: false,
    onActivate: ({ roomState, userId, bakuganKey, slot }) => {
        if (!roomState) return null
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        const deck = roomState?.decksState.find((d) => d.userId === userId)
        const userData = slotOfGate?.bakugans.find((bakugan) => bakugan.key === bakuganKey && bakugan.userId === userId)

        if (!slotOfGate && !deck && !userData) return null
        if (!deck) return null
        const haosOnDomain = roomState?.protalSlots.map((s) => s.bakugans.filter((b) => b.attribut === 'Pyrus').map((b) => b.key)).flat()
        if (haosOnDomain.length < 2) return null
        const bakugans = deck.bakugans.filter((bakugan) => bakugan && bakugan.bakuganData.onDomain === false && bakugan.bakuganData.elimined === false).filter((bakugan) => bakugan !== undefined && bakugan !== null)
        const request: AbilityCardsActions = {
            type: 'SELECT_BAKUGAN_TO_SET',
            message: 'Jet Enflammé: Quel Bakugan ajouter ?',
            bakugans: bakugans
        }
        return request

    },
    onAdditionalEffect({ resolution, roomData: roomState }) {

        if (!roomState) return null
        if (resolution.data.type !== 'SELECT_BAKUGAN_TO_SET') return;

        const { bakuganKey, slot, userId } = resolution
        const data = resolution.data

        const bakugan = data.bakugan

        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        const deck = roomState?.decksState.find((d) => d.userId === userId)

        if (slotOfGate && deck && bakugan) {
            const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)
            const haosOnDomain = roomState?.protalSlots.map((s) => s.bakugans.filter((b) => b.attribut === 'Pyrus').map((b) => b.key)).flat()

            const lastId = slotOfGate.bakugans.length > 0 ? slotOfGate.bakugans[slotOfGate.bakugans.length - 1].id : 0
            const newId = lastId + 1

            const newBakugan: bakuganOnSlot = {
                slot_id: slot,
                id: newId,
                key: bakugan.bakuganData.key,
                userId: userId,
                powerLevel: bakugan.bakuganData.powerLevel,
                currentPower: bakugan.bakuganData.powerLevel,
                attribut: bakugan.bakuganData.attribut,
                image: bakugan.bakuganData.image,
                abilityBlock: false,
                assist: true,
                family: bakugan.bakuganData.family
            }

            if (user && haosOnDomain && haosOnDomain.length >= 2) {
                slotOfGate.bakugans.push(newBakugan)
                bakugan.bakuganData.onDomain = true
                SetBakuganAndAddRenfortAnimationDirective({
                    animations: roomState.animations,
                    bakugan: newBakugan,
                    slot: slotOfGate
                })
            }
        }
    },
    onCanceled({ roomState, userId, slot }) {
        if (!roomState) return
        const slotToUpdate = roomState?.protalSlots.find((s) => s.id === slot)
        const deck = roomState?.decksState.find((d) => d.userId === userId)
        if (slotToUpdate && deck) {
            const assistsBakugans = slotToUpdate.bakugans.filter((b) => b.userId === userId && b.assist)

            assistsBakugans.forEach((a) => {
                const index = slotToUpdate.bakugans.findIndex((b) => b.key === a.key && b.assist === a.assist && b.userId === a.userId)
                slotToUpdate.bakugans.splice(index, 1)

                const deckDataToUpdate = deck.bakugans.find((b) => b?.bakuganData.key === a.key)
                if (deckDataToUpdate) {
                    deckDataToUpdate.bakuganData.onDomain = false
                    ComeBackBakuganDirectiveAnimation({
                        animations: roomState.animations,
                        bakugan: a,
                        slot: slotToUpdate
                    })
                }

            })

        }
    },
}

export const RetroAction: abilityCardsType = {
    key: 'retro-action',
    maxInDeck: 2,
    attribut: 'Pyrus',
    name: 'Retro Action',
    image: StandardCardsImages.pyrus,
    usable_in_neutral: false,
    description: `Calcine la carte portail de l'adversaire si elle est ouverte et en annule tous les effets`,
    onActivate: ({ roomState, userId, bakuganKey, slot }) => {
        if (!roomState) return null
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate) {
            const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)
            const gate = slotOfGate.portalCard?.key
            if (user && gate && slotOfGate.state.open) {
                const gateToCancel = GateCardsList.find((g) => g.key === gate)
                CancelGateCardDirectiveAnimation({
                    animations: roomState.animations,
                    slot: slotOfGate
                })
                if (gateToCancel && gateToCancel.onCanceled) {
                    gateToCancel.onCanceled({ roomState, slot, userId: userId, bakuganKey: bakuganKey })
                    slotOfGate.state.canceled = true
                }


            }
        }

        return null
    }
}

export const TourbillonDeFeu: abilityCardsType = {
    key: 'tourbillon-de-feu',
    attribut: 'Pyrus',
    name: 'Tourbillon de Feu',
    maxInDeck: 1,
    image: StandardCardsImages.pyrus,
    usable_in_neutral: false,
    description: `Protège l'utilisateur contre les effets de la carte portail et ajoute 50 G à l'utilisateur`,
    onActivate: ({ roomState, userId, bakuganKey, slot }) => {
        if (!roomState) return null
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate) {
            const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)

            if (user) {
                user.currentPower += 50
                PowerChangeDirectiveAnumation({
                    animations: roomState.animations,
                    bakugans: [user],
                    powerChange: 50,
                    malus: false
                })
            }
        }

        return null
    }
}