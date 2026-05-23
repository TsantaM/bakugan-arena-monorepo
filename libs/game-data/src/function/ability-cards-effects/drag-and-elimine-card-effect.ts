import { AbilityCardsList } from "../../battle-brawlers/ability-cards.js";
import { ExclusiveAbilitiesList } from "../../battle-brawlers/exclusive-abilities.js";
import { CancelAbilityCards } from "../../store/cancel-ability-cards.js";
import { Slots } from "../../store/slots.js";
import { AbilityCardsActions, resolutionType } from "../../type/actions-serveur-requests.js";
import { AnimationDirectivesTypes } from "../../type/animations-directives.js";
import { abilityCardsType, exclusiveAbilitiesType } from "../../type/game-data-types.js";
import { bakuganOnSlot, slots_id, stateType } from "../../type/room-types.js";
import { AbilityCardFailed } from "../create-animation-directives/ability-card-failed.js";
import { getAdjacentsSlots } from "../filters/get-adjacents-slots.js";
import { GetUserName } from "../get-user-name.js";
import { ComeBackBakuganEffect } from "./come-back-bakugan-effect.js";
import { DragAndElimineBakuganEffect } from "./drag-and-elimine-effect.js";

const getDragAndElimineTargets = (roomState: stateType, user: bakuganOnSlot) => {
    const userSlot = roomState.protalSlots[Slots.indexOf(user.slot_id)]
    if (!userSlot) return { bakugans: [], slotsWithOpponent: [] }

    const adjacentSlots = getAdjacentsSlots({ slot: userSlot, roomState: roomState })
    const slotsWithOpponent = adjacentSlots.filter((slot) => slot.bakugans.some((b) => b.userId !== user.userId))
    const bakugans = slotsWithOpponent.flatMap((slot) => slot.bakugans.filter((b) => b.userId !== user.userId))

    return { bakugans, slotsWithOpponent }
}

const eliminateDragAndElimineTargets = ({ roomState, user, bakugans }: { roomState: stateType, user: bakuganOnSlot, bakugans: bakuganOnSlot[] }) => {
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


export function DragAndElimineOnOpen({ roomState, userId, bakuganKey, slot, card }: {
    roomState: stateType;
    roomId: string;
    userId: string;
    bakuganKey: string;
    slot: slots_id;
    card: exclusiveAbilitiesType | abilityCardsType
}): null | AbilityCardsActions {

    const animation = AbilityCardFailed({ card: card.name })
    if (!roomState) return animation
    if (card.activationConditions && !card.activationConditions({ roomState, userId })) return animation

    const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
    if (!slotOfGate) return animation

    const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)
    if (!user) return animation
    if (card.canUse && !card.canUse({ bakugan: user, roomState: roomState })) return animation

    const { bakugans } = getDragAndElimineTargets(roomState, user)
    if (bakugans.length === 0) return null

    const opponentId = bakugans[0]?.userId
    const attributs = bakugans.map((b) => b.attribut)

    const player = roomState.players.find((p) => p.userId === opponentId)
    const deck = roomState.decksState.find((d) => d.userId === opponentId)

    if (deck && player && player.usable_abilitys > 0) {

        const cards = deck.abilities.filter((c) => CancelAbilityCards.includes(c.key) && !c.used && (c.attribut && attributs.includes(c.attribut))).filter((c, index, self) => index === self.findIndex((card) => card.key === c.key))


        if (cards.length > 0) {
            const request: AbilityCardsActions = {
                type: 'SELECT_ABILITY_CARD',
                data: cards.map((card) => ({
                    key: card.key,
                    description: card.description,
                    image: [...AbilityCardsList, ...ExclusiveAbilitiesList].find((ability) => ability.key === card.key)?.image || '',
                    name: card.name
                })),
                message: `${card.name} : Select one ability card`,
                target: opponentId,
                skipable: true
            }

            return request
        }
    }

    eliminateDragAndElimineTargets({ roomState: roomState, user: user, bakugans: bakugans })
    return null


}

export function DragAndElimineOnAdditional({ resolution, roomData, cardData }: { resolution: resolutionType, roomData: stateType, cardData: exclusiveAbilitiesType | abilityCardsType }) {
    if (!roomData) return
    if (resolution.data.type !== 'SELECT_ABILITY_CARD' && resolution.data.type !== 'SKIP_ACTION') return

    const slotOfGate = roomData.protalSlots.find((s) => s.id === resolution.slot)
    if (!slotOfGate) return

    const user = slotOfGate.bakugans.find((b) => b.key === resolution.bakuganKey && b.userId === resolution.userId)
    if (!user) return

    const { bakugans } = getDragAndElimineTargets(roomData, user)
    if (bakugans.length === 0) return

    if (resolution.data.type === 'SKIP_ACTION') {
        eliminateDragAndElimineTargets({ roomState: roomData, user: user, bakugans: bakugans })
        return
    }

    const { card, cardOwnerId } = resolution.data
    const ability = [...AbilityCardsList, ...ExclusiveAbilitiesList].flat().find((c) => c.key === card.key)

    const player = roomData.players.find((p) => p.userId === cardOwnerId)

    if (!ability || !player) {
        eliminateDragAndElimineTargets({ roomState: roomData, user: user, bakugans: bakugans })
        return
    }

    // player.usable_abilitys = player.usable_abilitys - 1

    const abilityCardUsed = roomData.decksState.find((d) => d.userId === cardOwnerId)?.abilities.find((a) => a.key === card.key && a.used === false)

    if (abilityCardUsed) {
        // FR: Marquer la carte capacité comme utilisée
        // ENG: Mark the ability card as used
        abilityCardUsed.used = true
    }

    const activeCardAnimation: AnimationDirectivesTypes = {
        type: 'ACTIVE_ABILITY_CARD',
        data: {
            card: ability.key,
            attribut: ability.attribut ? ability.attribut : 'Pyrus'
        },
        resolve: false,
        message: [{
            text: `Ability Card Activate : ${card.name}`,
            userName: GetUserName({
                roomData: roomData,
                userId: cardOwnerId,
            }),
            turn: roomData.turnState.turnCount
        }, {
            text: `${ability.description}`,
            turn: roomData.turnState.turnCount,
            description: true
        }]
    }

    roomData.animations.push(activeCardAnimation)

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

    const cardOwner = roomData.players.find((p) => p.userId === cardOwnerId)
    
    if (cardOwner) {
        cardOwner.usable_abilitys = cardOwner.usable_abilitys - 1
    }

    const antiMuseActivation = slotOfGate.activateAbilities.find((ability) =>
        ability.key === cardData.key &&
        ability.userId === resolution.userId &&
        ability.bakuganKey === resolution.bakuganKey
    )

    if (antiMuseActivation?.canceled) return

    eliminateDragAndElimineTargets({ roomState: roomData, user: user, bakugans: bakugans })
}