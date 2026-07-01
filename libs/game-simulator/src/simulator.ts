import type { ActionType, activeGateCardProps, setBakuganProps, setGateCardProps, slots_id, stateType, useAbilityCardProps } from "@bakugan-arena/game-data";
import { SimulateUpdateGate } from "./simulation-functions/simulator-set-gate-card.js";
import { CheckBattleAdventage } from "./check-adventage-functions/check-battle-adventage.js";
import { SimulateSetBakuganOnGate } from "./simulation-functions/simulation-set-bakugan.js";
import { SimulateUseAbilityCard } from "./simulation-functions/simulation-use-ability.js";
import { CheckNeutralAdventage } from "./check-adventage-functions/check-neutral-adventage.js";
import { CheckBasePowerAdventage } from "./check-adventage-functions/check-base-power-adventage.js";

export function SimulatorActionRequest(roomState: stateType, active: boolean) {
    const state = structuredClone(roomState)
    const actions = active ? state.ActivePlayerActionRequest : state.InactivePlayerActionRequest

    const target = actions.target === "ACTIVE_PLAYER" ? state.turnState.turn : state.players.find((user) => user.userId !== state.turnState.turn)?.userId || ''
    const { mustDo, mustDoOne, optional } = actions.actions

    type ScoreEntry =
        | {
            actionType: "SELECT_GATE_CARD"
            resolution: setGateCardProps
            score: number
        }
        | {
            actionType: "SET_GATE_CARD_ACTION"
            resolution: setGateCardProps
            score: number
        }
        | {
            actionType: "SET_BAKUGAN"
            resolution: setBakuganProps
            score: number
        }
        | {
            actionType: "USE_ABILITY_CARD"
            resolution: useAbilityCardProps
            score: number
        }
        | {
            actionType: "ACTIVE_GATE_CARD"
            resolution: activeGateCardProps,
            score: number
        }

    let scores: {
        mustDo: ScoreEntry[],
        mustDoOne: ScoreEntry[],
        optional: ScoreEntry[]
    } = {
        mustDo: [],
        mustDoOne: [],
        optional: []
    }

    function calculateFinalScore({ initialState: state, newState: newState, userId: target }: { initialState: stateType, newState: stateType, userId: string }): number {
        const finalScore: number = CheckBattleAdventage({ initialState: state, newState: newState, userId: target }) + CheckNeutralAdventage({ initialState: state, newState: newState, userId: target })
        return finalScore
    }

    function processActions({ actions: a, type }: { actions: ActionType, type: "mustDo" | "mustDoOne" | "optional" }) {
        if (a.type === "SELECT_GATE_CARD") {
            a.data.forEach((card) => {
                const slot: slots_id = state.turnState.turn === target ? 'slot-2' : 'slot-5'
                const newState = SimulateUpdateGate({
                    gateId: card.key,
                    roomState: state,
                    userId: target,
                    slot: slot
                })
                if (!newState) return

                const finalScore: number = calculateFinalScore({ initialState: state, newState: newState, userId: target })

                const score: ScoreEntry = {
                    actionType: a.type,
                    resolution: {
                        gateId: card.key,
                        roomId: state.roomId,
                        userId: target,
                        // slot: slot
                    },
                    score: finalScore
                }

                if (type === "mustDo") scores.mustDo.push(score)
                if (type === "mustDoOne") scores.mustDoOne.push(score)
                if (type === "optional") scores.optional.push(score)

            })
        }

        if (a.type === "SET_GATE_CARD_ACTION") {
            a.data.slots.forEach((slot) => {
                a.data.cards.forEach((card) => {

                    const newState = SimulateUpdateGate({
                        gateId: card.key,
                        roomState: state,
                        userId: target,
                        slot: slot
                    })

                    if (!newState) return

                    const finalScore: number = calculateFinalScore({ initialState: state, newState: newState, userId: target })

                    const score: ScoreEntry = {
                        actionType: a.type,
                        resolution: {
                            gateId: card.key,
                            roomId: state.roomId,
                            userId: target,
                            slot: slot
                        },
                        score: finalScore
                    }

                    if (type === "mustDo") scores.mustDo.push(score)
                    if (type === "mustDoOne") scores.mustDoOne.push(score)
                    if (type === "optional") scores.optional.push(score)

                })
            })
        }

        if (a.type === "SET_BAKUGAN") {
            a.data.setableSlots.forEach((slot) => {
                a.data.bakugans.forEach((bakugan) => {
                    const newState = SimulateSetBakuganOnGate({
                        bakuganKey: bakugan.key,
                        roomState: state,
                        slot: slot,
                        userId: target
                    })

                    if (!newState) return

                    const finalScore: number = calculateFinalScore({ initialState: state, newState: newState, userId: target }) + CheckBasePowerAdventage({ newState: newState, userId: target, slot: slot, bakuganKey: bakugan.key })

                    const score: ScoreEntry = {
                        actionType: a.type,
                        resolution: {
                            bakuganKey: bakugan.key,
                            roomId: state.roomId,
                            slot: slot,
                            userId: target
                        },
                        score: finalScore
                    }

                    if (type === "mustDo") scores.mustDo.push(score)
                    if (type === "mustDoOne") scores.mustDoOne.push(score)
                    if (type === "optional") scores.optional.push(score)

                })
            })
        }

        if (a.type === "USE_ABILITY_CARD") {
            a.data.forEach((d) => {
                d.abilities.forEach((ability) => {
                    const newState = SimulateUseAbilityCard({
                        abilityId: ability.key,
                        bakuganKey: d.bakuganKey,
                        roomId: state.roomId,
                        roomState: state,
                        slot: d.slot,
                        userId: target
                    })

                    if (!newState) return

                    const finalScore: number = calculateFinalScore({ initialState: state, newState: newState, userId: target })

                    const score: ScoreEntry = {
                        actionType: a.type,
                        resolution: {
                            abilityId: ability.key,
                            bakuganKey: d.bakuganKey,
                            roomId: state.roomId,
                            slot: d.slot,
                            userId: target
                        },
                        score: finalScore
                    }

                    if (type === "mustDo") scores.mustDo.push(score)
                    if (type === "mustDoOne") scores.mustDoOne.push(score)
                    if (type === "optional") scores.optional.push(score)

                })
            })
        }

        if (a.type === "ACTIVE_GATE_CARD") {
            const { activateAbilities, bakugans, can_set, id, portalCard } = a.data
            if (portalCard === null) return

            const newState = SimulateUpdateGate({
                gateId: portalCard.key,
                roomState: state,
                userId: target,
                slot: id
            })

            if(!newState) return
            
            const finalScore: number = calculateFinalScore({ initialState: state, newState: newState, userId: target })

            const score: ScoreEntry = {
                actionType: a.type,
                resolution: {
                    gateId: portalCard.key,
                    roomId: state.roomId,
                    userId: target,
                    slot: id
                },
                score: finalScore
            }

            if (type === "mustDo") scores.mustDo.push(score)
            if (type === "mustDoOne") scores.mustDoOne.push(score)
            if (type === "optional") scores.optional.push(score)

        }
    }

    mustDo.forEach((a) => {
        processActions({ actions: a, type: "mustDo" })
    })
    mustDoOne.forEach((a) => {
        processActions({ actions: a, type: "mustDoOne" })
    })
    optional.forEach((a) => {
        processActions({ actions: a, type: "optional" })
    })

    return scores

}