import { gateCardType } from "../../type/game-data-types";
import { ResetSlot } from "../../function/reset-slot";
import { CheckGameFinished } from "../../function/check-game-finished";
import { CheckBattle } from "../../function/check-battle-in-process";

export const MineFantome: gateCardType = {
    key: 'mine-fantome',
    name: 'Mine Fantôme',
    maxInDeck: 1,
    description: `Lorsque deux Bakugans se retrouvent sur cette carte ils sont tous les deux éliminés peu importe à qui ils appartiennent`,
    onOpen: ({ roomState, slot }) => {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        const otherPlayerId = roomState?.players.find((p) => p.userId !== slotOfGate?.portalCard?.userId)?.userId

        if (roomState && slotOfGate && slotOfGate.portalCard !== null && slotOfGate.state.open === false && slotOfGate.state.canceled === false && otherPlayerId) {
            slotOfGate.state.open = true
            const bakuganOnSlot = slotOfGate.bakugans.map((b) => b.key)
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
            roomState.turnState.can_change_player_turn = false

            ResetSlot(slotOfGate)
            roomState.battleState.battleInProcess = false
            roomState.battleState.slot = null
            roomState.battleState.paused = false

            roomState.turnState.set_new_bakugan = true
            roomState.turnState.set_new_gate = true


            CheckGameFinished({ roomId: roomState.roomId, roomState })
        }

    },

    onCanceled({ roomState, slot }) {
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
    name: 'Echange',
    maxInDeck: 1,
    description: `Tout Bakugan ayant un niveau de puissance supérieur ou égale à 400 G perd automatiquement`,
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
                usersBakuganDeck?.forEach((b) => {
                    b.onDomain = false
                    b.elimined = true
                })
                // slotOfGate.bakugans = slotOfGate.bakugans.filter(
                //     (b) => !usersBakuganKeys.includes(b.key)
                // )
            } else {
                usersBakuganDeck?.forEach((b) => {
                    b.onDomain = false
                })
            }

            if (totalPowerOpponentsBakugans >= 400) {
                console.log('elimination')
                opponentsBakuganDeck?.forEach((b) => {
                    b.onDomain = false
                    b.elimined = true
                })
                // slotOfGate.bakugans = slotOfGate.bakugans.filter(
                //     (b) => !opponentsBakuganKey.includes(b.key)
                // )
            } else {
                opponentsBakuganDeck?.forEach((b) => {
                    b.onDomain = false
                })
            }

            ResetSlot(slotOfGate)
            CheckBattle({ roomState })

            roomState.turnState.set_new_bakugan = true
            roomState.turnState.set_new_gate = true

            CheckGameFinished({ roomId: roomState.roomId, roomState })

        }
    },
    onCanceled({ roomState, slot }) {
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
    description: `Echange les niveau de puissance des bakugans au combat. Si elle n'est pas activée par le propriétaire, elle s'active automatiquement à la fin du combat.`,
    onOpen: ({ roomState, slot, userId }) => {
        return
    }
}

export const AspirateurDePuissance: gateCardType = {
    key: 'aspirateur-de-puissance',
    name: 'Aspirateur de Puissance',
    maxInDeck: 1,
    description: `Permet au premier Bakugan mit en jeu de voler 100 G de puissance au dernier Bakugan mit en jeu`,
    onOpen: ({ roomState, slot }) => {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)

        if (slotOfGate && !slotOfGate.state.open && !slotOfGate.state.canceled && !slotOfGate.state.blocked) {
            const firstBakugan = slotOfGate.bakugans[0]
            const lastBakugan = slotOfGate.bakugans[slotOfGate.bakugans.length - 1]
            firstBakugan.currentPower = firstBakugan.currentPower + 100
            lastBakugan.currentPower = lastBakugan.currentPower - 100
            slotOfGate.state.open = true
        }
    },
    onCanceled: ({ roomState, slot, userId, bakuganKey }) => {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        const bakuganUser = slotOfGate?.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)
        const bakuganOpponent = slotOfGate?.bakugans.find((b) => b.userId !== userId)

        if (slotOfGate && bakuganUser && bakuganOpponent && !slotOfGate.state.open && !slotOfGate.state.canceled && !slotOfGate.state.blocked) {
            const firstBakugan = slotOfGate.bakugans[0]
            const lastBakugan = slotOfGate.bakugans[slotOfGate.bakugans.length - 1]
            firstBakugan.currentPower = firstBakugan.currentPower - 100
            lastBakugan.currentPower = lastBakugan.currentPower + 100
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