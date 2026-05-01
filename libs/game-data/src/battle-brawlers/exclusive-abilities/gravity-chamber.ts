import { AbilityCardFailed, CheckBattle, ComeBackBakuganEffect, DragAndElimineBakuganEffect, getAdjacentsSlots } from "../../function/index.js"
import { Slots } from "../../store/slots.js"
import { exclusiveAbilitiesType } from "../../type/game-data-types.js"
import { HydranoidDarkus } from "../bakugans/hydranoid.js"

export const ChambreDeGravite: exclusiveAbilitiesType = {
    key: 'chambre-de-gravité',
    name: 'Gravity Chamber',
    description: `Attracts all opposing Bakugans on the Gate Cards adjecent to the one where Hydranoid is located that have a lower power level, and eliminates immediately.`,
    maxInDeck: 1,
    usable_in_neutral: true,
    usable_if_user_not_on_domain: false,
    onActivate: ({ roomState, userId, bakuganKey, slot }) => {
        const animation = AbilityCardFailed({ card: ChambreDeGravite.name })
        if (!roomState) return animation
        if (ChambreDeGravite.activationConditions && !ChambreDeGravite.activationConditions({ roomState, userId })) return animation

        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate) {
            const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)
            if (user) {
                if (ChambreDeGravite.canUse && !ChambreDeGravite.canUse({ bakugan: user, roomState: roomState })) return animation

                // user.currentPower += 100
                // PowerChangeDirectiveAnumation({
                //     animations: roomState?.animations,
                //     bakugans: [user],
                //     powerChange: 100,
                //     malus: false,
                //     turn: roomState.turnState.turnCount

                // })

                const slot = roomState.protalSlots[Slots.indexOf(user.slot_id)]
                const adjacentSlots = getAdjacentsSlots({ slot: slot, roomState: roomState })
                const slotsWithOpponent = adjacentSlots.filter((slot) => slot.bakugans.length > 0)

                if (slotsWithOpponent.length > 0) {

                    const bakugans = slotsWithOpponent.map((slot) => slot.bakugans.filter((b) => b.userId !== user.userId)).flat().filter((bakugan) => !bakugan.statut.trapped && !bakugan.statut.protectedAgainstAbility && !bakugan.statut.protected)

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
                        // else {

                        //     const resolution: resolutionType = {
                        //         bakuganKey: user.key,
                        //         cardKey: ChambreDeGravite.key,
                        //         roomId: roomState.roomId,
                        //         slot: slotOfGate.id,
                        //         userId: user.userId,
                        //         data: {
                        //             slot: b.slot_id,
                        //             bakugan: b.key,
                        //             type: 'SELECT_BAKUGAN_ON_DOMAIN'
                        //         }
                        //     }

                        //     dragBakuganToUserSlot({
                        //         roomState: roomState,
                        //         resolution: resolution
                        //     })
                        // }
                    })

                    ComeBackBakuganEffect({bakugan: user, roomState: roomState})

                }

                // CheckBattle({ roomState })
            }
        }

        return null
    },
    activationConditions({ roomState, userId }) {
        if (!roomState) return false
        if (roomState.battleState.battleInProcess) return false
        const bakugans = roomState.protalSlots
            .flatMap((slot) => slot.bakugans)
            .filter((bakugan) => bakugan.userId !== userId)

        if (bakugans.length === 0) return false
        return true
    },
    canUse({ roomState, bakugan }) {
        if (!roomState) return false

        if (bakugan.key !== HydranoidDarkus.key) return false
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

        return true
    },
}