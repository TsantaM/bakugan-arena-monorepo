import { AbilityCardFailed, AddRenfortAnimationDirective, CancelGateCardDirectiveAnimation, ComeBackBakuganDirectiveAnimation, CustomAnimationDirective, PowerChangeDirectiveAnumation } from "../../function/index.js";
import { AbilityCardsActions, bakuganOnSlot, type abilityCardsType } from "../../type/type-index.js";
import { GateCards, GateCardsList } from "../gate-gards.js";
import { Slots, StandardCardsImages } from "../../store/store-index.js";
import RemoveRenfortAnimationDirective from "../../function/create-animation-directives/remove-renfort-animation-directive.js";
import { PowerChange } from "../../function/ability-cards-effects/power-change.js";
import { ProtectCardEffect, RemoveProtectionCardEffect } from "../../function/ability-cards-effects/protect-card-effect.js";
import { ElementaryCardCancelerEffect } from "../../function/ability-cards-effects/elementary-card-canceler-effect.js";
import { AbilityCardsList, ExclusiveAbilitiesList } from "../index.js";

export const MurDeFeu: abilityCardsType = {
    key: "mur-de-feu",
    attribut: "Pyrus",
    maxInDeck: 3,
    usable_in_neutral: false,
    image: 'FireWall.png',
    onActivate: ({ roomState, userId, bakuganKey, slot }) => {
        if (!roomState) return null
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)

        if (slotOfGate) {
            const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)
            const opponents = slotOfGate.bakugans.filter((b) => b.userId !== userId)
            if (user) {
                CustomAnimationDirective({
                    roomState,
                    animationKey: MurDeFeu.key,
                    sourceBakugan: user,
                    targetBakugans: opponents,
                    slotId: slot,
                })

                opponents.forEach((b) => {
                    PowerChange({
                        bakugan: b,
                        G: 50,
                        malus: true,
                        roomState: roomState
                    })

                }
                )

                ProtectCardEffect({
                    bakugan: user,
                    cardKey: MurDeFeu.key,
                    origin: 'ABILITY',
                    protectionType: 'ABILITY',
                    roomState: roomState
                })

            }

        }

        return null
    },
    onCanceled({ roomState, userId, bakuganKey, slot }) {
        if (!roomState) return null
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)

        if (slotOfGate) {
            const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)
            const opponents = slotOfGate.bakugans.filter((b) => b.userId !== userId)
            if (user) {
                opponents.forEach((b) => {
                    PowerChange({
                        bakugan: b,
                        G: 50,
                        malus: false,
                        roomState: roomState
                    })
                })

                RemoveProtectionCardEffect({
                    bakugan: user,
                    cardKey: MurDeFeu.key,
                    origin: 'ABILITY',
                    protectionType: 'ABILITY',
                    roomState: roomState
                })

            }
        }

        return null
    },
}

export const JetEnflamme: abilityCardsType = {
    key: 'jet-enflamme',
    attribut: 'Pyrus',
    maxInDeck: 1,
    extraInputs: ['add-bakugan'],
    image: StandardCardsImages.pyrus,
    usable_in_neutral: false,
    onActivate: ({ roomState, userId, bakuganKey, slot }) => {

        const animation = AbilityCardFailed({ abilityKey: JetEnflamme.key })

        if (!roomState) return animation

        if (JetEnflamme.activationConditions) {
            const checker = JetEnflamme.activationConditions({ roomState, userId })
            if (checker === false) return animation
        }

        if (!roomState) return animation
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        const deck = roomState?.decksState.find((d) => d.userId === userId)
        const userData = slotOfGate?.bakugans.find((bakugan) => bakugan.key === bakuganKey && bakugan.userId === userId)

        if (!slotOfGate && !deck && !userData) return animation
        if (!deck) return null
        const haosOnDomain = roomState?.protalSlots.map((s) => s.bakugans.filter((b) => b.attribut === 'Pyrus').map((b) => b.key)).flat()
        if (haosOnDomain.length < 2) return animation
        const bakugans = deck.bakugans.filter((bakugan) => bakugan && bakugan.bakuganData.onDomain === false && bakugan.bakuganData.elimined === false).filter((bakugan) => bakugan !== undefined && bakugan !== null)
        const request: AbilityCardsActions = {
            type: 'SELECT_BAKUGAN_TO_SET',
            message: { key: 'prompt_select_bakugan_set', params: { abilityKey: JetEnflamme.key } },
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
                assist: {
                    addedWith: 'ABILITY',
                    assist: true,
                    key: JetEnflamme.key
                },
                statut: {
                    notRetreat: false,
                    trapped: false,
                    poisoned: false,
                    protectedAgainstGate: false,
                    protectedAgainstAbility: false,
                    protected: false,
                    absorbPowerBoost: false
                },
                family: bakugan.bakuganData.family
            }

            if (user && haosOnDomain && haosOnDomain.length >= 2) {
                slotOfGate.bakugans.push(newBakugan)
                bakugan.bakuganData.onDomain = true
                CustomAnimationDirective({
                    roomState,
                    animationKey: JetEnflamme.key,
                    sourceBakugan: newBakugan,
                    slotId: slot,
                    payload: {
                        slot: structuredClone(slotOfGate),
                    },
                })
                AddRenfortAnimationDirective({
                    animations: roomState.animations,
                    roomState,
                    bakugan: newBakugan,
                    slot: slotOfGate,
                    turn: roomState.turnState.turnCount,
                })
            }
        }
    },
    onCanceled({ roomState, userId, slot }) {
        if (!roomState) return
        const slotToUpdate = roomState?.protalSlots.find((s) => s.id === slot)
        const deck = roomState?.decksState.find((d) => d.userId === userId)
        if (slotToUpdate && deck) {
            const assistsBakugans = slotToUpdate.bakugans.filter((b) => b.userId === userId && b.assist && b.assist.key === JetEnflamme.key && b.assist.addedWith === 'ABILITY')
            assistsBakugans.forEach((a) => {
                const index = slotToUpdate.bakugans.findIndex((b) => b.key === a.key && b.assist === a.assist && b.userId === a.userId)
                slotToUpdate.bakugans.splice(index, 1)

                const deckDataToUpdate = deck.bakugans.find((b) => b?.bakuganData.key === a.key)
                if (deckDataToUpdate) {
                    deckDataToUpdate.bakuganData.onDomain = false
                    ComeBackBakuganDirectiveAnimation({
                        animations: roomState.animations,
                        bakugan: a,
                        slot: slotToUpdate,
                        roomState: roomState

                    })
                    RemoveRenfortAnimationDirective({
                        animations: roomState.animations,
                        bakugan: a,
                        turnCount: roomState.turnState.turnCount,
                        roomState: roomState

                    })
                }

            })

        }
    },
    activationConditions({ roomState, userId }) {
        if (!roomState) return false
        if (!roomState.battleState.battleInProcess || roomState.battleState.paused) return false
        const deck = roomState?.decksState.find((d) => d.userId === userId)
        if (!deck) return false
        const haosOnDomain = roomState?.protalSlots.map((s) => s.bakugans.filter((b) => b.attribut === 'Pyrus').map((b) => b.key)).flat()
        if (haosOnDomain.length < 2) return false
        const bakugans = deck.bakugans.filter((bakugan) => bakugan && bakugan.bakuganData.onDomain === false && bakugan.bakuganData.elimined === false).filter((bakugan) => bakugan !== undefined && bakugan !== null)
        if (bakugans.length === 0) return false
        return true
    },
    canUse({ bakugan, roomState }) {
        if (!roomState) return false

        if (bakugan.slot_id !== roomState.battleState.slot) return false

        return true
    }
}

export const RetroAction: abilityCardsType = {
    key: 'retro-action',
    maxInDeck: 2,
    attribut: 'Pyrus',
    image: StandardCardsImages.pyrus,
    usable_in_neutral: false,
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
                    animationKey: RetroAction.key,
                    sourceBakugan: user,
                    slotId: slot,
                })

                CancelGateCardDirectiveAnimation({
                    animations: roomState.animations,
                    slot: structuredClone(slotOfGate),
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

export const TourbillonDeFeu: abilityCardsType = {
    key: 'tourbillon-de-feu',
    attribut: 'Pyrus',
    maxInDeck: 1,
    image: 'FireTornado.png',
    usable_in_neutral: false,
    onActivate: ({ roomState, userId, bakuganKey, slot }) => {
        if (!roomState) return null
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate) {
            const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)
            const opponent = slotOfGate.bakugans.find((b) => b.userId !== userId)
            if (user && opponent) {
                CustomAnimationDirective({
                    roomState,
                    animationKey: TourbillonDeFeu.key,
                    sourceBakugan: user,
                    targetBakugans: [opponent],
                    slotId: slot,
                })

                PowerChange({
                    bakugan: user,
                    G: 100,
                    malus: false,
                    roomState: roomState
                })

                PowerChange({
                    bakugan: opponent,
                    G: 100,
                    malus: true,
                    roomState: roomState
                })
            }
        }

        return null
    },
    onCanceled({ roomState, userId, bakuganKey, slot }) {
        if (!roomState) return null
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate) {
            const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)
            const opponent = slotOfGate.bakugans.find((b) => b.userId !== userId)

            if (user && opponent) {
                PowerChange({
                    bakugan: user,
                    G: 100,
                    malus: true,
                    roomState: roomState
                })

                PowerChange({
                    bakugan: opponent,
                    G: 100,
                    malus: false,
                    roomState: roomState
                })
            }
        }

        return null
    },
}

export const BlazeReversal: abilityCardsType = {
    key: 'blaze-reversal',
    attribut: 'Pyrus',
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

export const HeatWave: abilityCardsType = {
    key: 'heat-wave',
    maxInDeck: 1,
    usable_in_neutral: false,
    attribut: 'Pyrus',
    onActivate({ roomState, userId, bakuganKey, slot }) {

        const failed = AbilityCardFailed({ abilityKey: HeatWave.key })

        const slotOfGate = roomState.protalSlots[Slots.indexOf(slot)]
        if (slotOfGate.portalCard === null) return failed
        const gateCard = GateCards[slotOfGate.portalCard.key]


        if (slotOfGate.state.open && !slotOfGate.state.canceled && slotOfGate.portalCard.userId !== userId) {
            CancelGateCardDirectiveAnimation({
                animations: roomState.animations,
                slot: slotOfGate,
                turn: roomState.turnState.turnCount,
                roomState: roomState

            })
            if (gateCard && gateCard.onCanceled) {
                gateCard.onCanceled({ roomState, slot, userId: userId, bakuganKey: bakuganKey })
                slotOfGate.state.canceled = true
            }
        }

        const opponents = slotOfGate.bakugans.filter((b) => b.userId !== userId)

        opponents.forEach((o) => PowerChange({
            bakugan: o,
            G: 50,
            malus: true,
            roomState: roomState
        }))

        return null
    },
    canUse({ roomState, bakugan }) {

        const { battleInProcess, paused, slot, turns } = roomState.battleState

        if (!battleInProcess || paused) return false

        if (bakugan.slot_id !== slot) return false

        const slotOfGate = roomState.protalSlots[Slots.indexOf(bakugan.slot_id)]
        if (slotOfGate.portalCard === null) return false

        const opponents = slotOfGate.bakugans.filter((b) => b.userId !== bakugan.userId)

        if (opponents.length === 0) return false

        return true

    },
}