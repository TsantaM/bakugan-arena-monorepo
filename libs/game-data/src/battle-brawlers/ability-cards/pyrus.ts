import { AbilityCardFailed, CancelGateCardDirectiveAnimation, ComeBackBakuganDirectiveAnimation, PowerChangeDirectiveAnumation, SetBakuganAndAddRenfortAnimationDirective } from "../../function/index.js";
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
    name: "Fire Wall",
    attribut: "Pyrus",
    description: "Substract 50 Gs from the opponents and protect the user against opponent's abilities",
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
    name: 'Rapid Fire',
    attribut: 'Pyrus',
    maxInDeck: 1,
    description: `Adds another Bakugan to the battle if there are 2 or more Pyrus bakugan on the field`,
    extraInputs: ['add-bakugan'],
    image: StandardCardsImages.pyrus,
    usable_in_neutral: false,
    onActivate: ({ roomState, userId, bakuganKey, slot }) => {

        const animation = AbilityCardFailed({ card: JetEnflamme.name })

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
            message: 'Rapid Fire: Select a Bakugan to set ?',
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
                    protected: false
                },
                family: bakugan.bakuganData.family
            }

            if (user && haosOnDomain && haosOnDomain.length >= 2) {
                slotOfGate.bakugans.push(newBakugan)
                bakugan.bakuganData.onDomain = true
                SetBakuganAndAddRenfortAnimationDirective({
                    animations: roomState.animations,
                    bakugan: newBakugan,
                    slot: slotOfGate,
                    turn: roomState.turnState.turnCount

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
                        animationsForReplay: roomState.animationsForReplay

                    })
                    RemoveRenfortAnimationDirective({
                        animations: roomState.animations,
                        bakugan: a,
                        turnCount: roomState.turnState.turnCount,
                        animationsForReplay: roomState.animationsForReplay

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
    name: 'Back Fire',
    image: StandardCardsImages.pyrus,
    usable_in_neutral: false,
    description: `Nullifies opponent's Gate Card`,
    onActivate: ({ roomState, userId, bakuganKey, slot }) => {
        if (!roomState) return null
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate) {
            const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)
            const gate = slotOfGate.portalCard?.key
            if (user && gate && slotOfGate.state.open) {
                console.log('la card lancée')
                const gateToCancel = GateCardsList.find((g) => g.key === gate)
                CancelGateCardDirectiveAnimation({
                    animations: roomState.animations,
                    slot: structuredClone(slotOfGate),
                    turn: roomState.turnState.turnCount,
                    animationsForReplay: roomState.animationsForReplay


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
    name: 'Fire Tornado',
    maxInDeck: 1,
    image: 'FireTornado.png',
    usable_in_neutral: false,
    description: `Adds 100 Gs to the user and decrease opponent power by 100 Gs`,
    onActivate: ({ roomState, userId, bakuganKey, slot }) => {
        if (!roomState) return null
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate) {
            const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)
            const opponent = slotOfGate.bakugans.find((b) => b.userId !== userId)
            if (user && opponent) {
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
    name: 'Blaze Reversal',
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

export const HeatWave: abilityCardsType = {
    key: 'heat-wave',
    name: 'Heat Wave',
    description: 'Cancel the gate card and decrease all opponents power by 50 Gs',
    maxInDeck: 1,
    usable_in_neutral: false,
    attribut: 'Pyrus',
    onActivate({ roomState, userId, bakuganKey, slot }) {

        const failed = AbilityCardFailed({ card: HeatWave.name })

        const slotOfGate = roomState.protalSlots[Slots.indexOf(slot)]
        if (slotOfGate.portalCard === null) return failed
        const gateCard = GateCards[slotOfGate.portalCard.key]


        if (slotOfGate.state.open && !slotOfGate.state.canceled && slotOfGate.portalCard.userId !== userId) {
            CancelGateCardDirectiveAnimation({
                animations: roomState.animations,
                slot: slotOfGate,
                turn: roomState.turnState.turnCount,
                animationsForReplay: roomState.animationsForReplay

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