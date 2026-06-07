import RemoveRenfortAnimationDirective from "../../../function/create-animation-directives/remove-renfort-animation-directive.js"
import { AutoActivationDuringBattle, ComeBackBakuganEffect, SetBakuganAndAddRenfortAnimationDirective } from "../../../function/index.js"
import { GateCardImages } from "../../../store/gate-card-images.js"
import { gateCardType } from "../../../type/game-data-types.js"
import { bakuganOnSlot, stateType } from "../../../type/room-types.js"
import { Bakugans } from "../../bakugans.js"

export const QuatuorDeCombat: gateCardType = {
    key: 'quatuor-de-combat',
    name: 'Quartet Battle',
    description: `Drag one bakugan from each player to join de battle`,
    image: GateCardImages.command,
    maxInDeck: 1,
    onOpen: ({ roomState, slot, userId }) => {
        if (!roomState) return null
        const opponentId = roomState?.players.find((p) => p.userId !== userId)?.userId
        const findWeakest = ({ userId, roomState }: { userId: string, roomState: stateType }) => {
            const deck = roomState?.decksState.find((d) => d.userId === userId)
            const bakugans = deck?.bakugans.filter((b) => !b?.bakuganData.elimined && !b?.bakuganData.onDomain)
            if (bakugans) {
                if (bakugans.length === 3) {
                    const firstBakugan = bakugans[0]
                    const secondBakugan = bakugans[1]
                    const thirdBakugan = bakugans[2]
                    if (firstBakugan && secondBakugan && thirdBakugan) {
                        const weakestFirst = firstBakugan?.bakuganData.powerLevel > secondBakugan.bakuganData.powerLevel ? firstBakugan : secondBakugan
                        const weakest = weakestFirst.bakuganData.powerLevel > thirdBakugan.bakuganData.powerLevel ? weakestFirst : thirdBakugan
                        return weakest
                    }

                } else if (bakugans.length === 2) {
                    const firstBakugan = bakugans[0]
                    const secondBakugan = bakugans[1]

                    if (firstBakugan && secondBakugan) {
                        const weakest = firstBakugan?.bakuganData.powerLevel > secondBakugan.bakuganData.powerLevel ? firstBakugan : secondBakugan
                        return weakest
                    }
                } else {
                    return bakugans[0]
                }
            } else {
                return null
            }
        }
        if (userId && opponentId) {
            const userWeakest = findWeakest({ userId: userId, roomState: roomState })
            const opponentWeakest = findWeakest({ userId: opponentId, roomState: roomState })
            const slotToUpdate = roomState.protalSlots.find((s) => s.id === slot)

            if (userWeakest && slotToUpdate && slotToUpdate.portalCard !== null && !slotToUpdate.state.canceled && !slotToUpdate.state.blocked) {
                const lastId = slotToUpdate.bakugans.length > 0 ? slotToUpdate.bakugans[slotToUpdate.bakugans.length - 1].id : 0
                const newId = lastId + 1

                if (userWeakest !== null) {

                    const secondAttribut = Bakugans[userWeakest.bakuganData.key].seconaryAttribut


                    const usersBakugan: bakuganOnSlot = {
                        slot_id: slot,
                        id: newId,
                        key: userWeakest.bakuganData.key,
                        userId: userId,
                        powerLevel: userWeakest.bakuganData.powerLevel,
                        currentPower: userWeakest.bakuganData.powerLevel,
                        attribut: userWeakest.bakuganData.attribut,
                        image: userWeakest.bakuganData.image,
                        abilityBlock: false,
                        assist: {
                            addedWith: 'GATE',
                            assist: true,
                            key: QuatuorDeCombat.key
                        },
                        statut: {
                            trapped: false,
                            notRetreat: false,
                            poisoned: false,
                            protectedAgainstGate: false,
                            protectedAgainstAbility: false,
                            protected: false
                        },
                        family: userWeakest.bakuganData.family
                    }

                    slotToUpdate.bakugans.push(usersBakugan)
                    userWeakest.bakuganData.onDomain = true
                    SetBakuganAndAddRenfortAnimationDirective({
                        animations: roomState.animations,
                        bakugan: usersBakugan,
                        slot: slotToUpdate,
                        turn: roomState.turnState.turnCount

                    })
                }
            }

            if (opponentWeakest && slotToUpdate && slotToUpdate.portalCard !== null && !slotToUpdate.state.canceled && !slotToUpdate.state.blocked) {

                if (opponentWeakest !== null) {
                    const lastId = slotToUpdate.bakugans.length > 0 ? slotToUpdate.bakugans[slotToUpdate.bakugans.length - 1].id : 0
                    const newId = lastId + 1

                    const secondAttribut = Bakugans[opponentWeakest.bakuganData.key].seconaryAttribut

                    const opponentBakugan: bakuganOnSlot = {
                        slot_id: slot,
                        id: newId,
                        key: opponentWeakest.bakuganData.key,
                        userId: opponentId,
                        powerLevel: opponentWeakest.bakuganData.powerLevel,
                        currentPower: opponentWeakest.bakuganData.powerLevel,
                        attribut: opponentWeakest.bakuganData.attribut,
                        secondAttribut: secondAttribut,
                        image: opponentWeakest.bakuganData.image,
                        abilityBlock: false,
                        assist: {
                            addedWith: 'GATE',
                            assist: true,
                            key: QuatuorDeCombat.key
                        },
                        statut: {
                            trapped: false,
                            notRetreat: false,
                            poisoned: false,
                            protectedAgainstGate: false,
                            protectedAgainstAbility: false,
                            protected: false

                        },
                        family: opponentWeakest.bakuganData.family
                    }

                    slotToUpdate.bakugans.push(opponentBakugan)
                    opponentWeakest.bakuganData.onDomain = true
                    slotToUpdate.state.open = true
                    SetBakuganAndAddRenfortAnimationDirective({
                        animations: roomState.animations,
                        bakugan: opponentBakugan,
                        slot: slotToUpdate,
                        turn: roomState.turnState.turnCount

                    })
                }
            }

        }

        const slotToUpdate = roomState.protalSlots.find((s) => s.id === slot)
        if (!slotToUpdate) return null
        slotToUpdate.state.open = true


        return null
    },
    onCanceled({ roomState, slot }) {
        if (!roomState) return
        const slotToUpdate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotToUpdate) {
            if (!slotToUpdate.state) return
            const { blocked, canceled, open } = slotToUpdate.state
            if (blocked) return
            if (!open || canceled) return
            const assistsBakugans = slotToUpdate.bakugans.filter((b) => b.assist && b.assist.key === QuatuorDeCombat.key && b.assist.addedWith === 'GATE')
            assistsBakugans.forEach((a) => {
                ComeBackBakuganEffect({ bakugan: a, roomState: roomState })
                RemoveRenfortAnimationDirective({
                    animations: roomState.animations,
                    bakugan: a,
                    turnCount: roomState.turnState.turnCount
                })
            })

        }
    },
    autoActivationCheck: ({ portalSlot, roomState }) => {

        if (!roomState) return false
        if (portalSlot.state.blocked) return false
        if (portalSlot.state.open) return false
        if (portalSlot.state.canceled) return false

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