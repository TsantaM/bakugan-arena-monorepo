import { AbilityCardFailed, CheckBattle, ComeBackBakuganEffect, DragAndElimineBakuganEffect, getAdjacentsSlots } from "../../function/index.js"
import { Slots } from "../../store/slots.js"
import { exclusiveAbilitiesType } from "../../type/game-data-types.js"
import { SirenoidAquos } from "../bakugans/sirenoid.js"

export const AntiMuse: exclusiveAbilitiesType = {
    key: 'anti-muse',
    name: 'Anthemusa',
    description: `Attracts all opposing Bakugans on the Gate Cards adjecent to the one where Sirenoid is located that have a lower power level, and eliminates immediately.`,
    maxInDeck: 1,
    extraInputs: ['drag-bakugan'],
    usable_in_neutral: true,
    slotLimits: true,
    usable_if_user_not_on_domain: false,
    image: 'Anthemusa.png',
    onActivate: ({ roomState, userId, bakuganKey, slot }) => {
        const animation = AbilityCardFailed({ card: AntiMuse.name })
        if (!roomState) return animation
        if (AntiMuse.activationConditions && !AntiMuse.activationConditions({ roomState, userId })) return animation

        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate) {
            const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)
            if (user) {
                if (AntiMuse.canUse && !AntiMuse.canUse({ bakugan: user, roomState: roomState })) return animation

                const slot = roomState.protalSlots[Slots.indexOf(user.slot_id)]
                const adjacentSlots = getAdjacentsSlots({ slot: slot, roomState: roomState })
                const slotsWithOpponent = adjacentSlots.filter((slot) => slot.bakugans.length > 0)

                if (slotsWithOpponent.length > 0) {

                    const bakugans = slotsWithOpponent.map((slot) => slot.bakugans.filter((b) => b.userId !== user.userId)).flat()

                    bakugans.forEach((b) => {

                        if (b.currentPower < user.currentPower) {

                            const targetSlot = roomState.protalSlots[Slots.indexOf(b.slot_id)]
                            DragAndElimineBakuganEffect({
                                roomState: roomState,
                                bakugan: b,
                                cardUser: user,
                                initialSlot: targetSlot
                            })

                        }
                    })

                    ComeBackBakuganEffect({ bakugan: user, roomState: roomState })

                }

                // CheckBattle({ roomState })
            }
        }

        return null
    },
    activationConditions({ roomState }) {
        if (!roomState) return false
        if (roomState.battleState.battleInProcess) return false
        const bakugans = roomState.protalSlots.filter((slot) => slot.bakugans.length > 0).map((slot) => slot.bakugans).flat()
        if (bakugans.length < 2) return false
        return true
    },
    canUse({ roomState, bakugan }) {
        if (!roomState) return false

        if (bakugan.key !== SirenoidAquos.key) return false
        const slot = roomState.protalSlots[Slots.indexOf(bakugan.slot_id)]
        const adjacentSlots = getAdjacentsSlots({ slot: slot, roomState: roomState })
        const slotsWithOpponent = adjacentSlots.filter(
            (slot) =>
                slot.portalCard !== null &&
                slot.bakugans.length > 0 &&
                slot.bakugans.some(
                    (b) =>
                        b.userId !== bakugan.userId &&
                        b.currentPower < bakugan.currentPower
                )
        )

        if (slotsWithOpponent.length === 0) return false

        if (slotsWithOpponent.length === 0) return false

        return true
    },

}