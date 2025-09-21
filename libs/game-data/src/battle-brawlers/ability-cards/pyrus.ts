import { abilityCardsType } from "../../type/game-data-types";
import { GateCardsList } from "../gate-gards";

export const MurDeFeu: abilityCardsType = {
    key: "mur-de-feu",
    name: "Mur de Feu",
    attribut: "Pyrus",
    description: "Retire 50 G aux bakugans adverses",
    maxInDeck: 3,
    onActivate: ({ roomState, userId, bakuganKey, slot }) => {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)

        if (slotOfGate) {
            const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)
            const opponents = slotOfGate.bakugans.filter((b) => b.userId !== userId)
            if (user) {
                opponents.forEach((b) => b.currentPower -= 50)
            }
        }
    },
}

export const JetEnflamme: abilityCardsType = {
    key: 'jet-enflamme',
    name: 'Jet Enflammé',
    attribut: 'Pyrus',
    maxInDeck: 1,
    description: `Permet d'ajouter un bakugan en plus au combat s'il y a déjà au moins un Bakugan Pyrus sur le terrain`,
    extraInputs: ['add-bakugan'],
    onActivate: ({ roomState, userId, bakuganKey, slot, bakuganToAdd }) => {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        const deck = roomState?.decksState.find((d) => d.userId === userId)
        const bakugan = deck?.bakugans.find((b) => b?.bakuganData.key === bakuganToAdd)
        if (slotOfGate && deck && bakugan) {
            const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)
            const pyrusOnDomain = roomState?.protalSlots.map((s) => s.bakugans.filter((b) => b.attribut === 'Pyrus').map((b) => b.key)).flat()
            const newBakugan = {
                key: bakugan.bakuganData.key,
                userId: userId,
                powerLevel: bakugan.bakuganData.powerLevel,
                currentPower: bakugan.bakuganData.powerLevel,
                attribut: bakugan.bakuganData.attribut,
                image: bakugan.bakuganData.image,
                abilityBlock: false
            }

            if (user && pyrusOnDomain && pyrusOnDomain.length >= 2) {
                slotOfGate.bakugans.push(newBakugan)
                bakugan.bakuganData.onDomain = true
            }
        }
    }
}

export const RetroAction: abilityCardsType = {
    key: 'retro-action',
    maxInDeck: 2,
    attribut: 'Pyrus',
    name: 'Retro Action',
    description: `Calcine la carte portail de l'adversaire si elle est ouverte et en annule tous les effets`,
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

export const TourbillonDeFeu: abilityCardsType = {
    key: 'tourbillon-de-feu',
    attribut: 'Pyrus',
    name: 'Tourbillon de Feu',
    maxInDeck: 1,
    description: `Protège l'utilisateur contre les effets de la carte portail et ajoute 50 G à l'utilisateur`,
    onActivate: ({ roomState, userId, bakuganKey, slot }) => {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate) {
            const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)

            if (user) {
                user.currentPower += 50
            }
        }
    }
}