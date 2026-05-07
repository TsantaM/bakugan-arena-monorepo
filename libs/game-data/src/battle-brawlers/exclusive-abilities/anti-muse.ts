import { AbilityCardFailed, ComeBackBakuganEffect, DragAndElimineBakuganEffect, getAdjacentsSlots } from "../../function/index.js"
import { Slots } from "../../store/slots.js"
import type { stateType, bakuganOnSlot } from "../../type/room-types.js"
import { AbilityCardsActions } from "../../type/actions-serveur-requests.js"
import { exclusiveAbilitiesType } from "../../type/game-data-types.js"
import { ContreMaitrise } from "../ability-cards/haos.js"
import { SirenoidAquos } from "../bakugans/sirenoid.js"
import { AbilityCardsList, ExclusiveAbilitiesList } from "../index.js"

const getAntiMuseTargets = (roomState: stateType, user: bakuganOnSlot) => {
    const userSlot = roomState.protalSlots[Slots.indexOf(user.slot_id)]
    if (!userSlot) return { bakugans: [], slotsWithOpponent: [] }

    const adjacentSlots = getAdjacentsSlots({ slot: userSlot, roomState: roomState })
    const slotsWithOpponent = adjacentSlots.filter((slot) => slot.bakugans.some((b) => b.userId !== user.userId))
    const bakugans = slotsWithOpponent.flatMap((slot) => slot.bakugans.filter((b) => b.userId !== user.userId))

    return { bakugans, slotsWithOpponent }
}

const eliminateAntiMuseTargets = ({ roomState, user, bakugans }: { roomState: stateType, user: bakuganOnSlot, bakugans: bakuganOnSlot[] }) => {
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
        if (!slotOfGate) return animation

        const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)
        if (!user) return animation
        if (AntiMuse.canUse && !AntiMuse.canUse({ bakugan: user, roomState: roomState })) return animation

        const { bakugans } = getAntiMuseTargets(roomState, user)
        if (bakugans.length === 0) return null

        const opponentId = bakugans[0]?.userId
        const attributs = bakugans.map((b) => b.attribut)

        const abilities: string[] = [ContreMaitrise.key]
        const deck = roomState.decksState.find((d) => d.userId === opponentId)

        if (deck) {
            const cards = deck.abilities.filter((c) => abilities.includes(c.key) && !c.used && (c.attribut && attributs.includes(c.attribut)))
            if (cards.length > 0) {
                const request: AbilityCardsActions = {
                    type: 'SELECT_ABILITY_CARD',
                    data: cards.map((card) => ({
                        key: card.key,
                        description: card.description,
                        image: [...AbilityCardsList, ...ExclusiveAbilitiesList].find((ability) => ability.key === card.key)?.image || '',
                        name: card.name
                    })),
                    message: `Anthemusa : Select one ability card`,
                    target: opponentId,
                    skipable: true
                }

                return request
            }
        }

        eliminateAntiMuseTargets({ roomState: roomState, user: user, bakugans: bakugans })
        return null
    },
    onAdditionalEffect({ resolution, roomData }) {
        if (!roomData) return
        if (resolution.data.type !== 'SELECT_ABILITY_CARD' && resolution.data.type !== 'SKIP_ACTION') return

        const slotOfGate = roomData.protalSlots.find((s) => s.id === resolution.slot)
        if (!slotOfGate) return

        const user = slotOfGate.bakugans.find((b) => b.key === resolution.bakuganKey && b.userId === resolution.userId)
        if (!user) return

        const { bakugans } = getAntiMuseTargets(roomData, user)
        if (bakugans.length === 0) return

        if (resolution.data.type === 'SKIP_ACTION') {
            eliminateAntiMuseTargets({ roomState: roomData, user: user, bakugans: bakugans })
            return
        }

        const { card, cardOwnerId } = resolution.data
        const ability = [...AbilityCardsList, ...ExclusiveAbilitiesList].flat().find((c) => c.key === card.key)

        if (!ability) {
            eliminateAntiMuseTargets({ roomState: roomData, user: user, bakugans: bakugans })
            return
        }

        ability.onActivate({
            roomState: roomData,
            roomId: roomData.roomId,
            bakuganKey: resolution.bakuganKey,
            slot: resolution.slot,
            userId: cardOwnerId,
            cardToCancel: {
                cardKey: resolution.cardKey,
                bakuganKey: resolution.bakuganKey,
                userId: resolution.userId,
                slot: resolution.slot
            }
        })

        const antiMuseActivation = slotOfGate.activateAbilities.find((ability) =>
            ability.key === AntiMuse.key &&
            ability.userId === resolution.userId &&
            ability.bakuganKey === resolution.bakuganKey
        )

        if (antiMuseActivation?.canceled) return

        eliminateAntiMuseTargets({ roomState: roomData, user: user, bakugans: bakugans })
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

        const slotOfUser = roomState.protalSlots[Slots.indexOf(bakugan.slot_id)]
        const opponents = slotOfUser.bakugans.filter((b) => b.userId !== bakugan.userId)
        if (opponents.length > 0) return false

        return true
    },

}