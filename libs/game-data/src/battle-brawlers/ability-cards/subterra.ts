import { ElementaryCardCancelerEffect } from "../../function/ability-cards-effects/elementary-card-canceler-effect.js";
import { AbilityCardFailed, CancelGateCardDirectiveAnimation, getJuxtaposablesSlots, PowerChange, PowerChangeDirectiveAnumation, SwipeGateCardEffect } from "../../function/index.js";
import { NewAdditionnalMessage } from "../../function/new-additional-message.js";
import { Slots, StandardCardsImages } from "../../store/store-index.js";
import type { AbilityCardsActions, abilityCardsType, ActionType, AnimationDirectivesTypes } from "../../type/type-index.js";
import { GateCards, GateCardsList } from "../gate-gards.js";
import { AbilityCardsList, ExclusiveAbilitiesList } from "../index.js";

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
            const battleSnapshot = roomState
                ? {
                    battleInProcess: roomState.battleState.battleInProcess,
                    paused: roomState.battleState.paused,
                    turns: roomState.battleState.turns,
                    slot: roomState.battleState.slot
                }
                : null

            if (user && gate) {

                if (slotOfGate.state.open === true && slotOfGate.state.canceled === false) {
                    const initialGate = GateCardsList.find((g) => g.key === gate)
                    const newGate = GateCardsList.find((g) => g.key === 'reacteur-subterra')
                    if (initialGate && newGate && newGate.onOpen) {
                        if (initialGate.onCanceled) {
                            initialGate.onCanceled({ roomState, slot, userId: userId, bakuganKey: bakuganKey })
                        }
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

                NewAdditionnalMessage({
                    roomState: roomState,
                    text: `Gate Card became ${GateCards['reacteur-subterra'].name}.`
                })

                // Keep the current battle running when the card is used during battle.
                // Some gate onCanceled/onOpen handlers can mutate battleState as side effects.
                if (roomState && battleSnapshot && battleSnapshot.battleInProcess && battleSnapshot.slot === slotOfGate.id) {
                    const stillABattle = slotOfGate.bakugans.length >= 2 && new Set(slotOfGate.bakugans.map((b) => b.userId)).size >= 2
                    if (stillABattle) {
                        roomState.battleState.battleInProcess = true
                        roomState.battleState.paused = false
                        roomState.battleState.slot = battleSnapshot.slot
                        roomState.battleState.turns = battleSnapshot.turns
                    }
                }
            }
        }
        return null
    },
    canUse({ roomState, bakugan }) {
        if (!roomState) return false
        const { battleInProcess, paused, slot } = roomState.battleState
        if (!battleInProcess || paused || slot === null) return false
        if (bakugan.slot_id !== slot) return false

        const slotOfGate = roomState.protalSlots[Slots.indexOf(slot)]
        if (!slotOfGate || slotOfGate.portalCard === null) return false
        if (slotOfGate.state.canceled) return false

        return true
    },
}

export const TectonicSwipe: abilityCardsType = {
    key: 'tectonic-swipe',
    name: 'Tectonic Swipe',
    maxInDeck: 1,
    description: `Cancel Gate card and Switches Gate Card with the one next to it`,
    usable_in_neutral: false,
    attribut: 'Subterra',
    onActivate: ({ roomState, userId, slot }) => {
        const animation = AbilityCardFailed({ card: TectonicSwipe.name })

        if (!roomState) return animation
        if (TectonicSwipe.activationConditions && !TectonicSwipe.activationConditions({ roomState, userId })) return animation

        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (!slotOfGate) return animation

        const swipableSlots = getJuxtaposablesSlots({ slot: slotOfGate, roomState: roomState }).filter((slot) => slot.portalCard !== null)

        if (swipableSlots.length < 1) return animation
        const slotsIds = swipableSlots.map((slot) => slot.id)

        const request: AbilityCardsActions = {
            type: 'SELECT_SLOT',
            message: 'Tectonic Swipe : Select a slot',
            slots: slotsIds
        }

        return request

    },
    onAdditionalEffect({ resolution, roomData }) {
        if (!roomData) return;
        if (resolution.data.type !== "SELECT_SLOT") return;

        SwipeGateCardEffect({
            bakuganKey: resolution.bakuganKey,
            roomData: roomData,
            selectedSlotId: resolution.data.slot,
            userId: resolution.userId,
            userSlotId: resolution.slot,
        })

    },
    activationConditions({ roomState }) {
        if (!roomState) return false
        const { battleInProcess, paused } = roomState.battleState
        if (!battleInProcess || paused) return false
        const slots = roomState.protalSlots.filter((slot) => slot.portalCard !== null)
        if (slots.length < 2) return false

        return true
    },
    canUse({ roomState, bakugan }) {

        if (!roomState) return false

        const slot = roomState.protalSlots.find((slot) => slot.id === bakugan.slot_id)
        if (!slot) return false
        if (slot.id !== roomState.battleState.slot) return false
        const juxtaposablesSlots = getJuxtaposablesSlots({ slot: slot, roomState: roomState })
        if (juxtaposablesSlots.length === 0) return false
        const swipableSlots = juxtaposablesSlots.filter((slot) => slot.portalCard !== null)
        if (swipableSlots.length === 0) return false

        return true

    },
}

export const EarthPower: abilityCardsType = {
    key: 'earth-power',
    attribut: 'Subterra',
    name: 'Earth Power',
    maxInDeck: 2,
    description: `Add 100 G to all of the user's Subterra Bakugans on the same gate card.`,
    image: StandardCardsImages.subterra,
    usable_in_neutral: false,
    onActivate({ roomState, userId, bakuganKey, slot }) {
        if (!roomState) return null

        const slotOfGate = roomState.protalSlots.find((s) => s.id === slot)
        if (!slotOfGate) return null
        const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)
        if (!user) return null

        const SubterraBakugans = slotOfGate.bakugans.filter((b) => b.attribut === "Subterra" && b.userId === userId)

        SubterraBakugans.forEach((bakugan) => {
            PowerChange({
                bakugan: bakugan,
                G: 100,
                malus: false,
                roomState: roomState
            })
        })

        return null
    },
    onCanceled({ roomState, userId, bakuganKey, slot }) {
        if (!roomState) return null

        const slotOfGate = roomState.protalSlots.find((s) => s.id === slot)
        if (!slotOfGate) return null
        const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)
        if (!user) return null

        const SubterraBakugans = slotOfGate.bakugans.filter((b) => b.attribut === "Subterra" && b.userId === userId)

        SubterraBakugans.forEach((bakugan) => {
            PowerChange({
                bakugan: bakugan,
                G: 100,
                malus: true,
                roomState: roomState
            })
        })

        return null
    },
    canUse({ roomState, bakugan }) {
        if (!roomState) return false

        const slotOfGate = roomState.protalSlots.find((s) => s.id === bakugan.slot_id)
        if (!slotOfGate) return false

        const { battleInProcess, paused, slot } = roomState.battleState
        if (!battleInProcess || paused) return false
        if (bakugan.slot_id !== slot) return false

        return true
    },
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

export const EarthShatter: abilityCardsType = {
    key: 'earth-shatter',
    name: 'Earth Shatter',
    attribut: 'Subterra',
    description: `Nullifies the opponent's Gate Card`,
    maxInDeck: 2,
    usable_in_neutral: false,
    image: StandardCardsImages.subterra,
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
                    slot: slotOfGate,
                    turn: roomState.turnState.turnCount
                })
                if (gateToCancel && gateToCancel.onCanceled) {
                    gateToCancel.onCanceled({ roomState, slot, userId: userId, bakuganKey: bakuganKey })
                    slotOfGate.state.canceled = true
                }


            }
        }

        return null
    },
    activationConditions({ roomState, userId }) {
        if (!roomState) return false
        const { battleInProcess, paused } = roomState.battleState
        if (!battleInProcess) return false
        if (battleInProcess && paused) return false

        return true
    },
    canUse({ roomState, bakugan }) {
        if (!roomState) return false
        const { battleInProcess, paused, slot } = roomState.battleState
        if (!battleInProcess) return false
        if (battleInProcess && paused) return false
        if (slot === null) return false

        const slotOfBakugan = roomState.protalSlots[Slots.indexOf(slot)]
        if (slotOfBakugan.portalCard === null) return false
        if (slotOfBakugan.portalCard.userId === bakugan.userId) return false
        if (!slotOfBakugan.state.open) return false
        if (slotOfBakugan.state.canceled) return false

        const card = GateCardsList.find((c) => c.key === slotOfBakugan.portalCard?.key)
        if (!card) return false
        if (!card.onCanceled) return false

        return true
    },
}

export const TerraLockdown: abilityCardsType = {
    key: 'terra-lockdown',
    attribut: 'Subterra',
    name: 'Terra Lockdown',
    description: `Nullifies the opponent's ability`,
    maxInDeck: 3,
    image: StandardCardsImages.haos,
    usable_in_neutral: false,
    onActivate: ({ roomState, userId, slot, cardToCancel }) => {
        return ElementaryCardCancelerEffect({ roomState, userId, slot, cardToCancel })
    },
    activationConditions({ roomState, userId }) {

        if (!roomState) return false

        const { battleInProcess, paused, slot, turns } = roomState.battleState

        if (!battleInProcess || paused) return false

        return true

    },
    canUse({ roomState, bakugan }) {

        if (!roomState) return false

        const { battleInProcess, paused, slot, turns } = roomState.battleState

        if (!battleInProcess || paused) return false

        if (bakugan.slot_id !== slot) return false

        const slotOfBattle = roomState.protalSlots.find((s) => s.id === slot)
        if (!slotOfBattle) return false

        const lists = [AbilityCardsList, ExclusiveAbilitiesList].flat()

        const abilities = slotOfBattle.activateAbilities.filter((ability) => {
            return (
                !ability.canceled &&
                ability.userId !== bakugan.userId &&
                lists.some((a) => a.key === ability.key && a.onCanceled)
            );
        });

        if (abilities.length < 1) return false

        return true
    },
}