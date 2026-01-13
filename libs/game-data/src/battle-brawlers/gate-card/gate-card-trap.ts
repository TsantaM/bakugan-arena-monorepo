import type { gateCardType } from "../../type/game-data-types";
import { ResetSlot } from "../../function/reset-slot";
import { CheckBattle } from "../../function/check-battle-in-process";
import { GateCardImages } from "../../store/gate-card-images";
import { ElimineBakuganDirectiveAnimation } from "../../function/create-animation-directives/elimine-bakugan";
import { ComeBackBakuganDirectiveAnimation } from "../../function/create-animation-directives/come-back-bakugan";
import { RemoveGateCardDirectiveAnimation } from "../../function/create-animation-directives/remove-gate-card";
import { PowerChangeDirectiveAnumation } from "../../function/create-animation-directives/power-change";
import { OpenGateCardActionRequest } from "../../function/action-request-functions/open-gate-card-action-request";
import { CheckBattleStillInProcess } from "../../function/check-battle-still-in-process";

export const MineFantome: gateCardType = {
    key: 'mine-fantome',
    name: 'Mine Ghost',
    maxInDeck: 1,
    description: `When two ore Bakugan stand on the Card, no matter wich side they are on, they both lose`,
    image: GateCardImages.command,
    onOpen: ({ roomState, slot }) => {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        const otherPlayerId = roomState?.players.find((p) => p.userId !== slotOfGate?.portalCard?.userId)?.userId

        if (roomState && slotOfGate && slotOfGate.portalCard !== null && slotOfGate.state.open === false && slotOfGate.state.canceled === false && otherPlayerId) {
            slotOfGate.state.open = true
            const bakuganOnSlot = slotOfGate.bakugans.map((b) => b.key)
            slotOfGate.bakugans.forEach((b) => {
                ElimineBakuganDirectiveAnimation({
                    animations: roomState.animations,
                    bakugan: b,
                    slot: structuredClone(slotOfGate)
                })
            })

            const bakuganOnSlotDeckState = roomState.decksState
                .flatMap(deck => deck.bakugans)           // On prend tous les bakugans de tous les decks
                .filter((b): b is NonNullable<typeof b> => b !== null && b !== undefined) // on retire null/undefined
                .map(b => b.bakuganData)                  // On prend les données réelles du bakugan
                .filter(bd => bakuganOnSlot.includes(bd.key))               // On garde uniquement ceux sur la carte
                .map(bd => bd)

            bakuganOnSlotDeckState.forEach((b) => {
                b.onDomain = false
                b.elimined = true
            })

            roomState.turnState.turn = slotOfGate.portalCard.userId
            roomState.turnState.previous_turn = otherPlayerId

            RemoveGateCardDirectiveAnimation({
                animations: roomState.animations,
                slot: slotOfGate
            })

            ResetSlot(slotOfGate)
            roomState.turnState.set_new_bakugan = true
            roomState.turnState.set_new_gate = true
            CheckBattleStillInProcess(roomState)
            CheckBattle({
                roomState: roomState
            })
            return {
                turnAction: true
            }
        } else {
            return null
        }

    },

    onCanceled() {
        return
    },
    autoActivationCheck: ({ portalSlot }) => {
        const bakugansOnSlot = portalSlot.bakugans.length
        if (bakugansOnSlot >= 2) {
            return true
        } else {
            return false
        }

    },
}

export const Echange: gateCardType = {
    key: 'echange',
    name: 'Trade Off',
    maxInDeck: 1,
    description: `If a Bakugan has 400 G-Power or more, it automaticaly lose`,
    image: GateCardImages.command,
    onOpen: ({ roomState, slot, userId }) => {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)

        if (slotOfGate && roomState && slotOfGate.state.open === false && slotOfGate.state.canceled === false) {
            slotOfGate.state.open = true
            const usersBakugan = slotOfGate.bakugans.filter((b) => b.userId === userId)
            const usersBakuganKeys = usersBakugan.map((b) => b.key)
            const usersBakuganDeck = roomState.decksState
                .find(d => d.userId === userId)?.bakugans
                .filter((b): b is NonNullable<typeof b> => b !== null && b !== undefined) // on retire null/undefined
                .map(b => b.bakuganData)                  // On prend les données réelles du bakugan
                .filter(bd => usersBakuganKeys.includes(bd.key))               // On garde uniquement ceux sur la carte
                .map(bd => bd)
            const totalPowerUsersBakugans = usersBakugan.reduce((acc, bakugan) => acc + bakugan.currentPower, 0)



            const opponentsBakugan = slotOfGate.bakugans.filter((b) => b.userId !== userId)
            const opponentsBakuganKey = opponentsBakugan.map((b) => b.key)
            const opponentsBakuganDeck = roomState.decksState
                .find(d => d.userId !== userId)?.bakugans
                .filter((b): b is NonNullable<typeof b> => b !== null && b !== undefined) // on retire null/undefined
                .map(b => b.bakuganData)                  // On prend les données réelles du bakugan
                .filter(bd => opponentsBakuganKey.includes(bd.key))               // On garde uniquement ceux sur la carte
                .map(bd => bd)
            const totalPowerOpponentsBakugans = opponentsBakugan.reduce((acc, bakugan) => acc + bakugan.currentPower, 0)

            if (totalPowerUsersBakugans >= 400) {
                usersBakugan.forEach((b) => {
                    ElimineBakuganDirectiveAnimation({
                        animations: roomState.animations,
                        bakugan: b,
                        slot: slotOfGate
                    })
                })
                usersBakuganDeck?.forEach((b) => {
                    b.onDomain = false
                    b.elimined = true
                })
                // slotOfGate.bakugans = slotOfGate.bakugans.filter(
                //     (b) => !usersBakuganKeys.includes(b.key)
                // )
            } else {
                usersBakugan.forEach((b) => {
                    ComeBackBakuganDirectiveAnimation({
                        animations: roomState.animations,
                        bakugan: b,
                        slot: slotOfGate
                    })
                })
                usersBakuganDeck?.forEach((b) => {
                    b.onDomain = false
                })
            }

            if (totalPowerOpponentsBakugans >= 400) {
                opponentsBakugan.forEach((b) => {
                    ElimineBakuganDirectiveAnimation({
                        animations: roomState.animations,
                        bakugan: b,
                        slot: slotOfGate
                    })
                })
                opponentsBakuganDeck?.forEach((b) => {
                    b.onDomain = false
                    b.elimined = true
                })
                // slotOfGate.bakugans = slotOfGate.bakugans.filter(
                //     (b) => !opponentsBakuganKey.includes(b.key)
                // )
            } else {
                opponentsBakugan.forEach((b) => {
                    ComeBackBakuganDirectiveAnimation({
                        animations: roomState.animations,
                        bakugan: b,
                        slot: slotOfGate
                    })
                })
                opponentsBakuganDeck?.forEach((b) => {
                    b.onDomain = false
                })
            }

            RemoveGateCardDirectiveAnimation({
                animations: roomState.animations,
                slot: slotOfGate
            })

            ResetSlot(slotOfGate)
            CheckBattleStillInProcess(roomState)
            CheckBattle({ roomState })
            OpenGateCardActionRequest({ roomState })

            roomState.turnState.set_new_bakugan = true
            roomState.turnState.set_new_gate = true


        }

        return null
    },
    onCanceled() {
        return
    },
    autoActivationCheck({ portalSlot }) {
        const enoughPowerLevels = portalSlot.bakugans.filter((b) => b.currentPower >= 400)
        if (enoughPowerLevels.length > 0) {
            return true
        } else {
            return false
        }
    },
}

export const SuperPyrus: gateCardType = {
    key: 'super-pyrus',
    name: 'Super Pyrus',
    maxInDeck: 1,
    image: GateCardImages.command,
    description: `Echange les niveau de puissance des bakugans au combat. Si elle n'est pas activée par le propriétaire, elle s'active automatiquement à la fin du combat.`,
    onOpen: () => {
        return null
    }
}

export const AspirateurDePuissance: gateCardType = {
    key: 'aspirateur-de-puissance',
    name: 'Energy Merge',
    maxInDeck: 1,
    description: `transfers 100 Gs from the last Bakugan Stand on the card to the first one`,
    image: GateCardImages.command,
    onOpen: ({ roomState, slot }) => {
        if (!roomState) return null
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)

        if (slotOfGate && !slotOfGate.state.open && !slotOfGate.state.canceled && !slotOfGate.state.blocked) {
            const firstBakugan = slotOfGate.bakugans[0]
            const lastBakugan = slotOfGate.bakugans[slotOfGate.bakugans.length - 1]
            firstBakugan.currentPower = firstBakugan.currentPower + 100
            PowerChangeDirectiveAnumation({
                animations: roomState.animations,
                bakugans: [firstBakugan],
                powerChange: 100,
                malus: false
            })
            lastBakugan.currentPower = lastBakugan.currentPower - 100
            PowerChangeDirectiveAnumation({
                animations: roomState.animations,
                bakugans: [lastBakugan],
                powerChange: 100,
                malus: true
            })
            slotOfGate.state.open = true
        }

        return null
    },
    onCanceled: ({ roomState, slot, userId, bakuganKey }) => {
        if (!roomState) return
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        const bakuganUser = slotOfGate?.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)
        const bakuganOpponent = slotOfGate?.bakugans.find((b) => b.userId !== userId)

        if (slotOfGate && bakuganUser && bakuganOpponent && !slotOfGate.state.open && !slotOfGate.state.canceled && !slotOfGate.state.blocked) {
            const firstBakugan = slotOfGate.bakugans[0]
            const lastBakugan = slotOfGate.bakugans[slotOfGate.bakugans.length - 1]
            firstBakugan.currentPower = firstBakugan.currentPower - 100
            PowerChangeDirectiveAnumation({
                animations: roomState.animations,
                bakugans: [firstBakugan],
                powerChange: 100,
                malus: true
            })
            lastBakugan.currentPower = lastBakugan.currentPower + 100
            PowerChangeDirectiveAnumation({
                animations: roomState.animations,
                bakugans: [lastBakugan],
                powerChange: 100,
                malus: false
            })
            slotOfGate.state.canceled = true
        }
    },
    autoActivationCheck: ({ portalSlot }) => {
        const bakugansOnSlot = portalSlot.bakugans.length
        if (bakugansOnSlot >= 2) {
            return true
        } else {
            return false
        }
    },
}