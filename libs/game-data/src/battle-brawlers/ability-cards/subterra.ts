import { pushReplayAnimation } from "../../function/replay/push-replay-animation.js";
import { ElementaryCardCancelerEffect } from "../../function/ability-cards-effects/elementary-card-canceler-effect.js";
import { AbilityCardFailed, CancelGateCardDirectiveAnimation, CustomAnimationDirective, getJuxtaposablesSlots, PowerChange, PowerChangeDirectiveAnumation, SwipeGateCardEffect } from "../../function/index.js";
import { NewAdditionnalMessage } from "../../function/new-additional-message.js";
import { Slots, StandardCardsImages } from "../../store/store-index.js";
import type { AbilityCardsActions, abilityCardsType, ActionType, AnimationDirectivesTypes } from "../../type/type-index.js";
import { GateCardsList } from "../gate-gards.js";
import { AbilityCardsList, ExclusiveAbilitiesList } from "../index.js";

export const MagmaSupreme: abilityCardsType = {
    key: 'magma-supreme',
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
                        const animation: AnimationDirectivesTypes = {
                            type: "OPEN_GATE_CARD",
                            data: {
                                slot: slotOfGate,
                                slotId: slotOfGate.id
                            },
                            resolved: false
                        }
                        roomState?.animations.push(animation)
                        pushReplayAnimation(roomState, animation)

                        newGate.onOpen({ roomState, slot, userId: userId, bakuganKey: bakuganKey })
                    }
                }

                slotOfGate.portalCard.key = 'reacteur-subterra'

                NewAdditionnalMessage({
                    roomState: roomState,
                    key: 'gate_card_became',
                    params: { gateKey: 'reacteur-subterra' },
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
    maxInDeck: 1,
    usable_in_neutral: false,
    attribut: 'Subterra',
    onActivate: ({ roomState, userId, slot }) => {
        const animation = AbilityCardFailed({ abilityKey: TectonicSwipe.key })

        if (!roomState) return animation
        if (TectonicSwipe.activationConditions && !TectonicSwipe.activationConditions({ roomState, userId })) return animation

        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (!slotOfGate) return animation

        const swipableSlots = getJuxtaposablesSlots({ slot: slotOfGate, roomState: roomState }).filter((slot) => slot.portalCard !== null)

        if (swipableSlots.length < 1) return animation
        const slotsIds = swipableSlots.map((slot) => slot.id)

        const request: AbilityCardsActions = {
            type: 'SELECT_SLOT',
            message: { key: 'prompt_select_slot', params: { abilityKey: TectonicSwipe.key } },
            slots: slotsIds
        }

        return request

    },
    onAdditionalEffect({ resolution, roomData }) {
        if (!roomData) return;
        if (resolution.data.type !== "SELECT_SLOT") return;

        const userSlot = roomData.protalSlots.find((s) => s.id === resolution.slot)
        const sourceBakugan = userSlot?.bakugans.find(
            (b) => b.key === resolution.bakuganKey && b.userId === resolution.userId,
        )

        CustomAnimationDirective({
            roomState: roomData,
            animationKey: TectonicSwipe.key,
            sourceBakugan,
            slotId: resolution.slot,
            payload: {
                targetSlotId: resolution.data.slot,
            },
        })

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
    maxInDeck: 2,
    image: StandardCardsImages.subterra,
    usable_in_neutral: false,
    onActivate({ roomState, userId, bakuganKey, slot }) {
        if (!roomState) return null

        const slotOfGate = roomState.protalSlots.find((s) => s.id === slot)
        if (!slotOfGate) return null
        const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)
        if (!user) return null

        const SubterraBakugans = slotOfGate.bakugans.filter((b) => b.attribut === "Subterra" && b.userId === userId)

        CustomAnimationDirective({
            roomState,
            animationKey: EarthPower.key,
            sourceBakugan: user,
            targetBakugans: SubterraBakugans,
            slotId: slot,
        })

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
    attribut: 'Subterra',
    maxInDeck: 1,
    image: StandardCardsImages.subterra,
    usable_in_neutral: false,
    onActivate: ({ roomState, userId, bakuganKey, slot }) => {
        if (!roomState) return null
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate) {
            const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)

            if (user) {
                PowerChange({
                    roomState,
                    bakugan: user,
                    G: 100,
                    malus: false,
                })
            }
        }

        return null
    }
}

export const EarthShatter: abilityCardsType = {
    key: 'earth-shatter',
    attribut: 'Subterra',
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

                CustomAnimationDirective({
                    roomState,
                    animationKey: EarthShatter.key,
                    sourceBakugan: user,
                    slotId: slot,
                })

                CancelGateCardDirectiveAnimation({
                    animations: roomState.animations,
                    slot: slotOfGate,
                    turn: roomState.turnState.turnCount,
                    roomState: roomState
                })
                if (gateToCancel && gateToCancel.onCanceled) {
                    gateToCancel.onCanceled({ roomState, slot, userId: userId, bakuganKey: bakuganKey })
                }

                slotOfGate.state.canceled = true

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
    maxInDeck: 3,
    image: StandardCardsImages.subterra,
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

export const GateBuilding: abilityCardsType = {
    key: 'gate-building',
    attribut: 'Subterra',
    maxInDeck: 1,
    image: StandardCardsImages.subterra,
    usable_in_neutral: true,
    onActivate({ roomState, userId }) {
        const animation = AbilityCardFailed({ abilityKey: GateBuilding.key })

        if (!roomState) return animation

        if (GateBuilding.activationConditions) {
            const checker = GateBuilding.activationConditions({ roomState, userId })
            if (checker === false) return animation
        }

        const usableSlots = roomState.protalSlots.filter((slot) => slot.portalCard === null)
        if (usableSlots.length === 0) return animation

        const preferredSlot = usableSlots.find((slot) => slot.id === 'slot-2')
            || usableSlots.find((slot) => slot.id === 'slot-5')
        const slotTarget = preferredSlot ?? usableSlots[Math.floor(Math.random() * usableSlots.length)]

        slotTarget.can_set = false
        slotTarget.portalCard = {
            key: "reacteur-subterra",
            userId: userId
        }

        slotTarget.state = {
            blocked: false,
            canceled: false,
            open: false
        }
        slotTarget.activateAbilities = []

        const animationToAdd: AnimationDirectivesTypes = {
            type: 'SET_GATE_CARD',
            data: {
                slot: structuredClone(slotTarget),
            },
            resolved: false,
            message: [{
                key: 'gate_card_built',
                turn: roomState.turnState.turnCount
            }]
        }

        roomState.animations.push(animationToAdd)
        pushReplayAnimation(roomState, animationToAdd)

        return null
    },
    activationConditions({ roomState, userId }) {
        const usableSlots = roomState.protalSlots.filter((slot) => slot.portalCard === null)
        if (usableSlots.length === 0) return false
        return true
    },
}