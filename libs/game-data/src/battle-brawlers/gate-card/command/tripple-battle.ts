import RemoveRenfortAnimationDirective from "../../../function/create-animation-directives/remove-renfort-animation-directive.js"
import { AutoActivationDuringBattle, ComeBackBakuganEffect, SetBakuganAndAddRenfortAnimationDirective } from "../../../function/index.js"
import { GateCardImages } from "../../../store/gate-card-images.js"
import { gateCardType } from "../../../type/game-data-types.js"
import { bakuganOnSlot, stateType } from "../../../type/room-types.js"

export const TripleCombat: gateCardType = {
    key: 'triple-combat',
    name: 'Tripple Battle',
    description: `Drag your weakest Bakugan to the battle`,
    image: GateCardImages.command,
    maxInDeck: 1,
    onOpen: ({ roomState, slot, userId }) => {
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
                        const strongestFirst = firstBakugan?.bakuganData.powerLevel < secondBakugan.bakuganData.powerLevel ? firstBakugan : secondBakugan
                        const strongest = strongestFirst.bakuganData.powerLevel < thirdBakugan.bakuganData.powerLevel ? strongestFirst : thirdBakugan
                        return strongest
                    }

                } else if (bakugans.length === 2) {
                    const firstBakugan = bakugans[0]
                    const secondBakugan = bakugans[1]

                    if (firstBakugan && secondBakugan) {
                        const strongest = firstBakugan?.bakuganData.powerLevel < secondBakugan.bakuganData.powerLevel ? firstBakugan : secondBakugan
                        return strongest
                    }
                } else {
                    return bakugans[0]
                }
            } else {
                return null
            }
        }
        if (userId && opponentId) {
            const userStrongest = findWeakest({ userId: userId, roomState: roomState })
            const slotToUpdate = roomState.protalSlots.find((s) => s.id === slot)
            if (userStrongest && slotToUpdate && slotToUpdate.portalCard !== null && !slotToUpdate.state.canceled && !slotToUpdate.state.blocked) {
                if (userStrongest !== null) {

                    const lastId = slotToUpdate.bakugans.length > 0 ? slotToUpdate.bakugans[slotToUpdate.bakugans.length - 1].id : 0
                    const newId = lastId + 1

                    const usersBakugan: bakuganOnSlot = {
                        slot_id: slot,
                        id: newId,
                        key: userStrongest.bakuganData.key,
                        userId: userId,
                        powerLevel: userStrongest.bakuganData.powerLevel,
                        currentPower: userStrongest.bakuganData.powerLevel,
                        attribut: userStrongest.bakuganData.attribut,
                        image: userStrongest.bakuganData.image,
                        abilityBlock: false,
                        assist: {
                            key: TripleCombat.key,
                            addedWith: 'GATE',
                            assist: true
                        },
                        statut: {
                            trapped: false,
                            notRetreat: false,
                            poisoned: false,
                            protectedAgainstGate: false,
                            protectedAgainstAbility: false,
                            protected: false
                        },
                        family: userStrongest.bakuganData.family
                    }

                    slotToUpdate.bakugans.push(usersBakugan)
                    userStrongest.bakuganData.onDomain = true
                    slotToUpdate.state.open = true
                    SetBakuganAndAddRenfortAnimationDirective({
                        animations: roomState.animations,
                        bakugan: usersBakugan,
                        slot: slotToUpdate,
                        turn: roomState.turnState.turnCount

                    })

                }
            }

        }
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
            const assistsBakugans = slotToUpdate.bakugans.filter((b) => b.assist && b.assist.key === TripleCombat.key && b.assist.addedWith === 'GATE')
            assistsBakugans.forEach((a) => {
                ComeBackBakuganEffect({ bakugan: a, roomState: roomState })
                RemoveRenfortAnimationDirective({
                    animations: roomState.animations,
                    bakugan: a,
                    turnCount: roomState.turnState.turnCount,
                    animationsForReplay: roomState.animationsForReplay

                })
            })

        }
    },
    autoActivationCheck: ({ portalSlot, roomState }) => {

        if (!roomState) return false
        if (portalSlot.state.blocked) return false
        if (portalSlot.state.open) return false
        if (portalSlot.state.canceled) return false

        const playerDeck = roomState?.decksState.find((deck) => deck.userId === portalSlot.portalCard?.userId)

        if (!playerDeck) return false
        const bakugans = playerDeck.bakugans.map((b) => b?.bakuganData).filter((b) => b !== undefined).filter((b) => b.onDomain === false && b.elimined === false)

        if (bakugans.length === 0) return false

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
