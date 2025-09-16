import { abilityCardsType } from "../../type/game-data-types";
import { GateCardsList } from "../gate-gards";

export const MagmaSupreme: abilityCardsType = {
    key: 'magma-supreme',
    name: 'Magma Supreme',
    description: `Transforme l'élément de la carte portail par celui de la terre (Subterra)`,
    attribut: 'Subterra',
    maxInDeck: 1,
    onActivate: ({ roomState, userId, bakuganKey, slot }) => {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate && slotOfGate.portalCard) {
            const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)
            const gate = slotOfGate.portalCard.key

            if (user && gate) {

                if (slotOfGate.state.open === true && slotOfGate.state.canceled === false) {
                    const initialGate = GateCardsList.find((g) => g.key === gate)
                    const newGate = GateCardsList.find((g) => g.key === 'reacteur-subterra')
                    if (initialGate && initialGate.onCanceled && newGate && newGate.onOpen) {
                        initialGate.onCanceled({ roomState, slot, userId: userId, bakuganKey: bakuganKey })
                        newGate.onOpen({ roomState, slot, userId: userId, bakuganKey: bakuganKey })

                    }
                }

                slotOfGate.portalCard.key = 'reacteur-subterra'
            }
        }
    }
}

export const ChuteColossale: abilityCardsType = {
    key: 'chute-colossale',
    attribut: 'Subterra',
    name: 'Chute Colossale',
    maxInDeck: 2,
    description: `Permet à l'utilisateur de déplacer la carte portail où il se trouve vers une autre place sur le domaine`,
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


export const CopieConforme: abilityCardsType = {
    key: 'copie-conforme',
    name: 'Copie Conforme',
    attribut: 'Subterra',
    maxInDeck: 1,
    description: `Permet de copier une des carte maîtrise déjà utilisée par l'adversaire`,
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


export const Obstruction: abilityCardsType = {
    key: 'obstruction',
    name: 'Obstruction',
    attribut: 'Subterra',
    maxInDeck: 1,
    description: `L'utilisateur s'empare du niveau de puissance de l'adversaire avant l'utilisation de la maîtrise`,
    onActivate: ({ roomState, userId, bakuganKey, slot }) => {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate) {
            const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)
            const opponent = slotOfGate.bakugans.find((b) => b.userId !== userId)
            if (user && opponent) {
                const opponentPower = opponent.currentPower
                user.currentPower += opponentPower
            }
        }
    }
}


export const ForceDattraction: abilityCardsType = {
    key: `force-d'attraction`,
    name: `Force d'Attraction`,
    maxInDeck: 2,
    attribut: 'Subterra',
    description: `Permet d'attirer un bakugan alier sur la carte portail où se trouve l'utilisateur`,
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