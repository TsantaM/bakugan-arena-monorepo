import { ResetSlot } from "../../function/reset-slot";
import { gateCardType } from "../../type/game-data-types";
import { stateType } from "../../type/room-types";

export const Rechargement: gateCardType = {
    key: 'rechargement',
    name: 'Rechargement',
    maxInDeck: 1,
    description: `Augmente le niveau de puissance du propriétaire de la carte de 100 G par Bakugan présent sur le domaine ayant le même élément`,
    onOpen: ({ roomState, slot, bakuganKey, userId }) => {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        const bakuganUser = slotOfGate?.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)

        if (slotOfGate && bakuganUser) {
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

        if (slotOfGate && bakuganUser) {
            const bakuganAttribut = bakuganUser.attribut
            const sameAttributOnDomain = roomState?.protalSlots.map((s) => s.bakugans.filter((b) => b.attribut === bakuganAttribut).map((b) => b.key))
            if (sameAttributOnDomain) {
                slotOfGate.state.open = true
                const merged = sameAttributOnDomain.flat()
                const malus = 100 * merged.length
                bakuganUser.currentPower = bakuganUser.currentPower -= malus
            }
        }
    }
}

export const TripleCombat: gateCardType = {
    key: 'triple-combat',
    name: 'Triple Combat',
    description: `Permet d'ajouter un Bakugan en plus sur le terrain`,
    maxInDeck: 1,
    onOpen: ({ roomState, slot, userId }) => {
        return
    }
}

export const QuatuorDeCombat: gateCardType = {
    key: 'quatuor-de-combat',
    name: 'Quatuor de Combat',
    description: `Attire au jeu sur la carte le bakugan le plus faible encore jouable dans le deck de chaque joueur`,
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
                        const weakestFirst = firstBakugan?.bakuganData.powerLevel < secondBakugan.bakuganData.powerLevel ? firstBakugan : secondBakugan
                        const weakest = weakestFirst.bakuganData.powerLevel < thirdBakugan.bakuganData.powerLevel ? weakestFirst : thirdBakugan
                        return weakest
                    }

                } else if (bakugans.length === 2) {
                    const firstBakugan = bakugans[0]
                    const secondBakugan = bakugans[1]

                    if (firstBakugan && secondBakugan) {
                        const weakest = firstBakugan?.bakuganData.powerLevel < secondBakugan.bakuganData.powerLevel ? firstBakugan : secondBakugan
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
                    const usersBakugan = {
                        key: userWeakest.bakuganData.key,
                        userId: userId,
                        powerLevel: userWeakest.bakuganData.powerLevel,
                        currentPower: userWeakest.bakuganData.powerLevel,
                        attribut: userWeakest.bakuganData.attribut,
                        image: userWeakest.bakuganData.image,
                        abilityBlock: false
                    }

                    slotToUpdate.bakugans.push(usersBakugan)

                }

                if (opponentWeakest !== null) {
                    const opponentBakugan = {
                        key: opponentWeakest.bakuganData.key,
                        userId: opponentId,
                        powerLevel: opponentWeakest.bakuganData.powerLevel,
                        currentPower: opponentWeakest.bakuganData.powerLevel,
                        attribut: opponentWeakest.bakuganData.attribut,
                        image: opponentWeakest.bakuganData.image,
                        abilityBlock: false
                    }

                    slotToUpdate.bakugans.push(opponentBakugan)
                }
                slotToUpdate.state.open
            }

        }
    }
}

export const RetourDAssenceur: gateCardType = {
    key: 'retour-d-air',
    name: `Retour d'assenceur`,
    maxInDeck: 1,
    description: `Oblige le Bakugan de l'adversaire mis en jeu à revenir immédiatement entre les main de son propriétaire`,
    onOpen({ roomState, slot, userId }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate) {
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
    onOpen: ({ roomState, slot, userId }) => {
        return
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

            if (roomState) {
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