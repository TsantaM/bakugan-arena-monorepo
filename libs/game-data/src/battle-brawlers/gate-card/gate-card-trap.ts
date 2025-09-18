import { gateCardType } from "../../type/game-data-types";
import { ResetSlot } from "../../function/reset-slot";
import { CheckGameFinished } from "../../function/check-game-finished";

export const MineFantome: gateCardType = {
    key: 'mine-fantome',
    name: 'Mine Fantôme',
    maxInDeck: 1,
    description: `Lorsque deux Bakugans se retrouvent sur cette carte ils sont tous les deux éliminés peu importe à qui ils appartiennent`,
    onOpen: ({ roomState, slot }) => {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (roomState && slotOfGate && slotOfGate.state.open === false && slotOfGate.state.canceled === false) {
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
            ResetSlot(slotOfGate)
            roomState.battleState.battleInProcess = false
            roomState.battleState.slot = null
            roomState.battleState.paused = false
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
                .filter(bd => usersBakuganKeys.includes(bd.key))               // On garde uniquement ceux sur la carte
                .map(bd => bd)
            const totalPowerOpponentsBakugans = opponentsBakugan.reduce((acc, bakugan) => acc + bakugan.currentPower, 0)

            if (totalPowerUsersBakugans >= 400) {
                usersBakuganDeck?.forEach((b) => {
                    b.onDomain = false,
                        b.elimined = true
                })
                slotOfGate.bakugans = slotOfGate.bakugans.filter(
                    (b) => !usersBakuganKeys.includes(b.key)
                )
            }

            if (totalPowerOpponentsBakugans >= 400) {
                opponentsBakuganDeck?.forEach((b) => {
                    b.onDomain = false,
                        b.elimined = true
                })
                slotOfGate.bakugans = slotOfGate.bakugans.filter(
                    (b) => !opponentsBakuganKey.includes(b.key)
                )
            }

            CheckGameFinished({ roomId: roomState.roomId, roomState })

        }
    },
    onCanceled({ roomState, slot }) {
        return
    },
    autoActivationCheck({ portalSlot }) {
        const enoughPowerLevels = portalSlot.bakugans.filter((b) => b.currentPower >= 400)
        if(enoughPowerLevels.length > 0) {
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