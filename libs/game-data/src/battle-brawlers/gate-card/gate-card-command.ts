import { ResetSlot } from "../../function/reset-slot";
import { gateCardType } from "../../type/game-data-types";
import { bakuganOnSlot, stateType } from "../../type/room-types";

export const Rechargement: gateCardType = {
    key: 'rechargement',
    name: 'Rechargement',
    maxInDeck: 1,
    description: `Augmente le niveau de puissance du propriétaire de la carte de 100 G par Bakugan présent sur le domaine ayant le même élément`,
    onOpen: ({ roomState, slot, bakuganKey, userId }) => {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        const bakuganUser = slotOfGate?.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)

        if (slotOfGate && bakuganUser && !slotOfGate.state.open && !slotOfGate.state.canceled && !slotOfGate.state.blocked) {
            const bakuganAttribut = bakuganUser.attribut
            const sameAttributOnDomain = roomState?.protalSlots.map((s) => s.bakugans.filter((b) => b.attribut === bakuganAttribut).map((b) => b.key))
            if (sameAttributOnDomain) {
                slotOfGate.state.open = true
                const merged = sameAttributOnDomain.flat()
                const bonus = 100 * merged.length
                bakuganUser.currentPower = bakuganUser.currentPower += bonus
            }
        }
    },
    onCanceled: ({ roomState, slot, userId, bakuganKey }) => {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        const bakuganUser = slotOfGate?.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)

        if (slotOfGate && bakuganUser && slotOfGate.state.open && !slotOfGate.state.canceled) {
            const bakuganAttribut = bakuganUser.attribut
            const sameAttributOnDomain = roomState?.protalSlots.map((s) => s.bakugans.filter((b) => b.attribut === bakuganAttribut).map((b) => b.key))
            if (sameAttributOnDomain) {
                const merged = sameAttributOnDomain.flat()
                const malus = 100 * merged.length
                bakuganUser.currentPower = bakuganUser.currentPower -= malus
                slotOfGate.state.canceled = true
            }
        }
    }
}

export const GrandEsprit: gateCardType = {
    key: 'grand-esprit',
    name: 'Grand Esprit',
    maxInDeck: 1,
    description: `Augmente le niveau de puissance du propriétaire de la carte de 50 G par cartes portails présentes sur le domaine`,
    onOpen({ roomState, slot, bakuganKey, userId }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        const bakuganUser = slotOfGate?.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)
        const gateCount = roomState?.protalSlots.filter((s) => s.portalCard !== null)

        if (slotOfGate && bakuganUser && gateCount && !slotOfGate.state.open && !slotOfGate.state.canceled && !slotOfGate.state.blocked) {
            const bonus = 50 * gateCount.length
            bakuganUser.currentPower = bakuganUser.currentPower + bonus
            slotOfGate.state.open = true
        }
    },
    onCanceled({ roomState, slot, bakuganKey, userId }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        const bakuganUser = slotOfGate?.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)
        const gateCount = roomState?.protalSlots.filter((s) => s.portalCard !== null)

        if (slotOfGate && bakuganUser && gateCount && slotOfGate.state.open && !slotOfGate.state.canceled) {
            const malus = 100 * gateCount.length
            bakuganUser.currentPower = bakuganUser.currentPower - malus
            slotOfGate.state.canceled = true
        }
    },
}

export const TripleCombat: gateCardType = {
    key: 'triple-combat',
    name: 'Triple Combat',
    description: `Permet au propriétaire de la carte d'attirer le bakugan de son deck non éliminé et hors domaine ayant le niveau de puissance le plus faible`,
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
                    const usersBakugan: bakuganOnSlot = {
                        key: userStrongest.bakuganData.key,
                        userId: userId,
                        powerLevel: userStrongest.bakuganData.powerLevel,
                        currentPower: userStrongest.bakuganData.powerLevel,
                        attribut: userStrongest.bakuganData.attribut,
                        image: userStrongest.bakuganData.image,
                        abilityBlock: false,
                        assist: false
                    }

                    slotToUpdate.bakugans.push(usersBakugan)
                    userStrongest.bakuganData.onDomain = true
                    slotToUpdate.state.open = true

                }
            }

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

export const QuatuorDeCombat: gateCardType = {
    key: 'quatuor-de-combat',
    name: 'Quatuor de Combat',
    description: `Attire au jeu sur la carte le bakugan le plus puissant encore jouable dans le deck de chaque joueur`,
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
            if (userWeakest && opponentWeakest && slotToUpdate && slotToUpdate.portalCard !== null && !slotToUpdate.state.canceled && !slotToUpdate.state.blocked) {
                if (userWeakest !== null) {
                    const usersBakugan: bakuganOnSlot = {
                        key: userWeakest.bakuganData.key,
                        userId: userId,
                        powerLevel: userWeakest.bakuganData.powerLevel,
                        currentPower: userWeakest.bakuganData.powerLevel,
                        attribut: userWeakest.bakuganData.attribut,
                        image: userWeakest.bakuganData.image,
                        abilityBlock: false,
                        assist: false
                    }

                    slotToUpdate.bakugans.push(usersBakugan)
                    userWeakest.bakuganData.onDomain = true
                }

                if (opponentWeakest !== null) {
                    const opponentBakugan: bakuganOnSlot = {
                        key: opponentWeakest.bakuganData.key,
                        userId: opponentId,
                        powerLevel: opponentWeakest.bakuganData.powerLevel,
                        currentPower: opponentWeakest.bakuganData.powerLevel,
                        attribut: opponentWeakest.bakuganData.attribut,
                        image: opponentWeakest.bakuganData.image,
                        abilityBlock: false,
                        assist: false
                    }

                    slotToUpdate.bakugans.push(opponentBakugan)
                    opponentWeakest.bakuganData.onDomain = true
                    slotToUpdate.state.open = true

                }
            }

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

export const RetourDAssenceur: gateCardType = {
    key: 'retour-d-air',
    name: `Retour d'assenceur`,
    maxInDeck: 1,
    description: `Oblige le Bakugan de l'adversaire mis en jeu à revenir immédiatement entre les main de son propriétaire`,
    onOpen({ roomState, slot, userId }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate && !slotOfGate.state.open && !slotOfGate.state.canceled && !slotOfGate.state.blocked) {
            const opponent = slotOfGate.bakugans.filter((b) => b.userId !== userId)
            if (opponent.length > 0) {
                const opponentDeck = roomState?.decksState.find((d) => d.userId !== userId)
                const opponentsKey = opponent.map((b) => b.key)
                const bakugansOnGate = opponentDeck?.bakugans.filter((b): b is NonNullable<typeof b> => b !== null && b !== undefined && opponentsKey.includes(b.bakuganData.key)).map(b => b.bakuganData)
                slotOfGate.state.open = true
                opponent.forEach((b) => {
                    const index = slotOfGate.bakugans.findIndex((ba) => ba.key === b.key && ba.userId === b.userId)
                    if (index !== -1 && bakugansOnGate && roomState) {
                        slotOfGate.bakugans.splice(index, 1)
                        bakugansOnGate?.forEach((b) => {
                            b.onDomain = false
                        })
                        roomState.battleState.battleInProcess = false
                        roomState.battleState.slot = null
                        roomState.battleState.paused = false
                    }
                })
            }
        }
    },
    onCanceled({ roomState, slot }) {
        return
    },
}

export const BoucEmissaire: gateCardType = {
    key: 'bouc-emissaire',
    name: 'Bouc Emissaire',
    maxInDeck: 1,
    description: `Le propriétaire du premier Bakugan placé sur la carte peut décider de continuer le combat ou d'y mettre fin`,
    onOpen: ({ roomState, slot }) => {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)

        if (roomState && slotOfGate && !slotOfGate.state.open && !slotOfGate.state.canceled && !slotOfGate.state.blocked) {
            ResetSlot(slotOfGate)

            roomState.battleState.battleInProcess = false
            roomState.battleState.slot = null
            roomState.battleState.paused = false
        }
    }
}

export const Armistice: gateCardType = {
    key: 'armistice',
    name: 'Armistice',
    maxInDeck: 1,
    description: `Met fin au combat et tous les Bakugans sur la carte quittent le champs de batail. Toutes les cartes maîtrises utilisées seront perdues`,
    onOpen({ roomState, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate) {
            const bakugansOnGate = slotOfGate.bakugans.map((b) => b.key)
            ResetSlot(slotOfGate)

            if (roomState && !slotOfGate.state.open && !slotOfGate.state.canceled && !slotOfGate.state.blocked) {
                roomState.decksState.forEach((d) => {
                    d.bakugans.filter((b) => b && bakugansOnGate.includes(b.bakuganData.key)).forEach((b) => {
                        if (b && bakugansOnGate.includes(b.bakuganData.key)) {
                            b.bakuganData.onDomain = false
                        }
                    })

                })

                roomState.battleState.battleInProcess = false
                roomState.battleState.slot = null
                roomState.battleState.paused = false
            }

        }
    },
    onCanceled({ roomState, slot }) {
        return
    },
}