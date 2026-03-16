import { AbilityCardFailed, AddRenfortAnimationDirective, CheckBattle, dragBakuganToUserSlot, MoveToAnotherSlotDirectiveAnimation, OpenGateCardActionRequest, PowerChangeDirectiveAnumation } from "../../function/index.js";
import { StandardCardsImages } from "../../store/store-index.js";
import type { AbilityCardsActions, abilityCardsType, bakuganOnSlot, bakuganToMoveType2 as bakuganToMoveType, slots_id } from "../../type/type-index.js";
import { GateCardsList } from "../gate-gards.js";

export const MagmaSupreme: abilityCardsType = {
    key: 'magma-supreme',
    name: 'Magma Prominence',
    description: `Changes the Gate Card's attribute to Subterra.`,
    attribut: 'Subterra',
    maxInDeck: 1,
    usable_in_neutral: false,
    image: StandardCardsImages.subterra,
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
                        slotOfGate.state.open = false
                        slotOfGate.state.canceled = false
                        roomState?.animations.push({
                            type: "OPEN_GATE_CARD",
                            data: {
                                slot: slotOfGate,
                                slotId: slotOfGate.id
                            },
                            resolved: false
                        })
                        newGate.onOpen({ roomState, slot, userId: userId, bakuganKey: bakuganKey })
                    }
                }

                slotOfGate.portalCard.key = 'reacteur-subterra'
            }
        }
        return null
    }
}

export const ChuteColossale: abilityCardsType = {
    key: 'chute-colossale',
    attribut: 'Subterra',
    name: 'Chute Colossale',
    maxInDeck: 2,
    description: `Permet à l'utilisateur de déplacer la carte portail où il se trouve vers une autre place sur le domaine`,
    image: StandardCardsImages.subterra,
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


export const CopieConforme: abilityCardsType = {
    key: 'copie-conforme',
    name: 'Copycat',
    attribut: 'Subterra',
    maxInDeck: 1,
    description: `Copies an ability that the opponent used or is using`,
    image: StandardCardsImages.subterra,
    usable_in_neutral: false,
    onActivate: ({ roomState, userId, bakuganKey, slot }) => {
        if (!roomState) return null
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate) {
            const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)

            if (user) {
                user.currentPower += 100
                PowerChangeDirectiveAnumation({
                    animations: roomState?.animations,
                    bakugans: [user],
                    powerChange: 100,
                    malus: false,
                    turn: roomState.turnState.turnCount

                })
            }
        }

        return null
    }
}