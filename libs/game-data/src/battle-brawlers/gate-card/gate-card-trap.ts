import { AutoActivationDuringBattle, CheckBattle, CheckBattleStillInProcess, ComeBackBakuganDirectiveAnimation, ComeBackBakuganEffect, ElimineBakuganDirectiveAnimation, ElimineBakuganEffect, OpenGateCardActionRequest, PowerChangeDirectiveAnumation, RemoveGateCardDirectiveAnimation, ResetSlot, Slots, SwipePowerLevelsEffects, type gateCardType } from "../../index.js";
import { GateCardImages } from "../../store/gate-card-images.js";

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
            const bakugans = slotOfGate.bakugans
            bakugans.forEach((bakugan) => {
                ElimineBakuganEffect({ bakugan: bakugan, roomState: roomState })
            })


            // const bakuganOnSlotDeckState = roomState.decksState
            //     .flatMap(deck => deck.bakugans)           // On prend tous les bakugans de tous les decks
            //     .map(b => b.bakuganData)                  // On prend les données réelles du bakugan
            //     .filter(bd => bakuganOnSlot.includes(bd.key))               // On garde uniquement ceux sur la carte
            //     .map(bd => bd)

            // bakuganOnSlotDeckState.forEach((b) => {
            //     b.onDomain = false
            //     b.elimined = true
            // })

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
            const totalPowerUsersBakugans = usersBakugan.reduce((acc, bakugan) => acc + bakugan.currentPower, 0)

            const opponentsBakugan = slotOfGate.bakugans.filter((b) => b.userId !== userId)
            const totalPowerOpponentsBakugans = opponentsBakugan.reduce((acc, bakugan) => acc + bakugan.currentPower, 0)

            if (totalPowerUsersBakugans >= 400) {


                usersBakugan.forEach((b) => {
                    ElimineBakuganEffect({
                        bakugan: b,
                        roomState: roomState
                    })
                })

                // slotOfGate.bakugans = slotOfGate.bakugans.filter(
                //     (b) => !usersBakuganKeys.includes(b.key)
                // )
            } else {

                usersBakugan.forEach((b) => {
                    ComeBackBakuganEffect({
                        bakugan: b,
                        roomState: roomState
                    })
                })

            }

            if (totalPowerOpponentsBakugans >= 400) {

                opponentsBakugan.forEach((b) => {
                    ElimineBakuganEffect({
                        bakugan: b,
                        roomState: roomState
                    })
                })

                // slotOfGate.bakugans = slotOfGate.bakugans.filter(
                //     (b) => !opponentsBakuganKey.includes(b.key)
                // )
            } else {

                opponentsBakugan.forEach((b) => {
                    ComeBackBakuganEffect({
                        bakugan: b,
                        roomState: roomState
                    })
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
    autoActivationCheck({ portalSlot }) {
        if (!portalSlot?.bakugans || portalSlot.bakugans.length === 0) {
            return false
        }

        // Grouper les bakugans par userId
        const powerByUser: Record<string, number> = {}

        portalSlot.bakugans.forEach((b) => {
            if (!powerByUser[b.userId]) {
                powerByUser[b.userId] = 0
            }
            powerByUser[b.userId] += b.currentPower
        })

        // Vérifier si au moins un joueur atteint 400
        return Object.values(powerByUser).some(total => total >= 400)
    }
}

export const SuperPyrus: gateCardType = {
    key: 'super-pyrus',
    name: 'Super Pyrus',
    maxInDeck: 1,
    image: GateCardImages.command,
    description: `Swaps the G-Power of your Bakugan with your opponent. (Automatically open on battle end)`,
    activeOnBattleEnd: {
        canBeActiveBefore: true,
        autoActiveOnEnd: false,
        activeBeforeElimination: true
    },
    onOpen({ roomState, slot }) {

        if (!roomState) return null
        const slotOfGate = roomState.protalSlots[Slots.indexOf(slot)]
        const userId = slotOfGate.portalCard?.userId
        if (!userId) return null

        SwipePowerLevelsEffects({
            roomState: roomState,
            slot: slotOfGate,
            userId: userId
        })

        return null

    },
    onCanceled({ roomState, slot }) {
        if (!roomState) return null
        const slotOfGate = roomState.protalSlots[Slots.indexOf(slot)]
        const userId = slotOfGate.portalCard?.userId
        if (!userId) return null

        SwipePowerLevelsEffects({
            roomState: roomState,
            slot: slotOfGate,
            userId: userId
        })

        return null
    },
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
                malus: false,
                turn: roomState.turnState.turnCount

            })
            lastBakugan.currentPower = lastBakugan.currentPower - 100
            PowerChangeDirectiveAnumation({
                animations: roomState.animations,
                bakugans: [lastBakugan],
                powerChange: 100,
                malus: true,
                turn: roomState.turnState.turnCount

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

        if (slotOfGate && bakuganUser && bakuganOpponent && slotOfGate.state.open && !slotOfGate.state.canceled && !slotOfGate.state.blocked) {
            const firstBakugan = slotOfGate.bakugans[0]
            const lastBakugan = slotOfGate.bakugans[slotOfGate.bakugans.length - 1]
            firstBakugan.currentPower = firstBakugan.currentPower - 100
            PowerChangeDirectiveAnumation({
                animations: roomState.animations,
                bakugans: [firstBakugan],
                powerChange: 100,
                malus: true,
                turn: roomState.turnState.turnCount

            })
            lastBakugan.currentPower = lastBakugan.currentPower + 100
            PowerChangeDirectiveAnumation({
                animations: roomState.animations,
                bakugans: [lastBakugan],
                powerChange: 100,
                malus: false,
                turn: roomState.turnState.turnCount

            })
            slotOfGate.state.canceled = true
        }
    },
    autoActivationCheck: ({ portalSlot, roomState }) => {
        const bakugansOnSlot = portalSlot.bakugans.length
        const canActiveOnBattle = AutoActivationDuringBattle({ roomState: roomState, canActive: false, slotOfGate: portalSlot.id })

        if (canActiveOnBattle === false) {
            return canActiveOnBattle
        } else {
            if (bakugansOnSlot >= 2) {
                return true
            } else {
                return false
            }
        }
    },
}