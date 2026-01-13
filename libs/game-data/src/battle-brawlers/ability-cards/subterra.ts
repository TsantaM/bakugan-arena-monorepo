import { OpenGateCardActionRequest } from "../../function/action-request-functions/open-gate-card-action-request";
import { CheckBattle } from "../../function/check-battle-in-process";
import { AddRenfortAnimationDirective } from "../../function/create-animation-directives/add-renfort-directive";
import { MoveToAnotherSlotDirectiveAnimation } from "../../function/create-animation-directives/move-to-another-slot";
import { PowerChangeDirectiveAnumation } from "../../function/create-animation-directives/power-change";
import { StandardCardsImages } from "../../store/ability-cards-images";
import type { AbilityCardsActions, bakuganToMoveType } from "../../type/actions-serveur-requests";
import { type abilityCardsType } from "../../type/game-data-types";
import type { bakuganOnSlot, slots_id } from "../../type/room-types";
import { GateCardsList } from "../gate-gards";

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
                    malus: false
                })
            }
        }

        return null
    }
}


export const Obstruction: abilityCardsType = {
    key: 'obstruction',
    name: 'Dragoon',
    attribut: 'Subterra',
    maxInDeck: 1,
    description: `Adds the opponent's G-Power to user`,
    image: StandardCardsImages.subterra,
    usable_in_neutral: false,
    onActivate: ({ roomState, userId, bakuganKey, slot }) => {
        if (!roomState) return null
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate) {
            const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)
            const opponent = slotOfGate.bakugans.find((b) => b.userId !== userId)
            if (user && opponent) {
                const opponentPower = opponent.currentPower
                user.currentPower += opponentPower
                PowerChangeDirectiveAnumation({
                    animations: roomState?.animations,
                    bakugans: [user],
                    powerChange: opponentPower,
                    malus: false
                })
            }
        }

        return null
    }
}


export const ForceDattraction: abilityCardsType = {
    key: `force-d'attraction`,
    name: `Attractor`,
    maxInDeck: 2,
    attribut: 'Subterra',
    description: `Attract one Bakugan from another Gate Card to user's Gate Card`,
    image: StandardCardsImages.subterra,
    extraInputs: ['drag-bakugan'],
    usable_in_neutral: false,

    onActivate: ({ roomState, userId, bakuganKey, slot }) => {
        if (!roomState) return null

        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        const deck = roomState?.decksState.find((d) => d.userId === userId)
        const userData = slotOfGate?.bakugans.find((bakugan) => bakugan.key === bakuganKey && bakugan.userId === userId)

        if (!slotOfGate && !deck && !userData) return null

        const slots = roomState.protalSlots.filter((s) => s.portalCard !== null && s.id !== slot && s.bakugans.length > 0).map((slot) => slot.bakugans).flat()
        const bakugans: bakuganToMoveType[] = slots.map((bakugan) => ({
            key: bakugan.key,
            userId: bakugan.userId,
            slot: bakugan.slot_id
        }))

        const request: AbilityCardsActions = {
            type: 'SELECT_BAKUGAN_ON_DOMAIN',
            message: "Attractor : Select a Bakugan to drag",
            bakugans: bakugans
        }

        return request


    },
    onAdditionalEffect: ({ resolution, roomData: roomState }) => {
        if (!roomState) return
        if (resolution.data.type !== 'SELECT_BAKUGAN_ON_DOMAIN') return

        const slotToDrag: slots_id = resolution.data.slot
        const target: string = resolution.data.bakugan
        const slotTarget = roomState?.protalSlots.find((s) => s.id === slotToDrag)
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === resolution.slot);

        // const targetToDrag = slotTarget?.bakugans.find((b) => b.key === target)
        if (slotOfGate && slotTarget && target !== '') {
            const BakuganTargetIndex = slotTarget.bakugans.findIndex((b) => b.key === target)
            const bakuganToDrag = slotTarget?.bakugans.find((b) => b.key === target)

            const user = slotOfGate?.bakugans.find((b) => b.key === resolution.bakuganKey && b.userId === resolution.userId)

            if (user && bakuganToDrag) {

                const newState: bakuganOnSlot = {
                    ...bakuganToDrag,
                    slot_id: slotOfGate.id
                }

                slotOfGate.bakugans.push(newState)
                slotTarget.bakugans.splice(BakuganTargetIndex, 1)
                MoveToAnotherSlotDirectiveAnimation({
                    animations: roomState?.animations,
                    bakugan: bakuganToDrag,
                    initialSlot: slotTarget,
                    newSlot: slotOfGate
                })

                if (roomState.battleState.battleInProcess && roomState.battleState.slot === slotOfGate.id) {
                    if (slotOfGate.bakugans.some((b) => b.userId === bakuganToDrag.userId)) {
                        AddRenfortAnimationDirective({
                            animations: roomState?.animations,
                            bakugan: bakuganToDrag,
                            slot: slotOfGate
                        })
                    }
                }

                CheckBattle({ roomState })
                OpenGateCardActionRequest({ roomState })

            }
        }
    }

}