import { AbilityCardsList, AnimationDirectivesTypes, CheckBattle, CheckBattleStillInProcess, ExclusiveAbilitiesList, gateCardAdditionalRequest, GetUserName, portalSlotsTypeElement, RemoveGateCardDirectiveAnimation, ResetSlot, resolutionGateCardType, stateType } from "../../index.js";
import { NewAdditionnalMessage } from "../new-additional-message.js";


export type ResolveMineGhostOpenParams = {
    roomState: stateType
    slotOfGate: portalSlotsTypeElement
    otherPlayerId: string
    cardsList: string[]
    onNoCard: () => null | gateCardAdditionalRequest
}

export function ResolveTrapCardOnOpen({
    roomState,
    slotOfGate,
    otherPlayerId,
    cardsList,
    onNoCard
}: ResolveMineGhostOpenParams): null | gateCardAdditionalRequest {

    const bakugans = slotOfGate.bakugans

    const opponentsBakugans = bakugans.filter(
        (b) => b.userId !== slotOfGate.portalCard?.userId
    )

    const attributs = opponentsBakugans.map((b) => b.attribut)

    const deck = roomState.decksState.find(
        (d) => d.userId === otherPlayerId
    )

    const cards = deck?.abilities.filter(
        (c) =>
            cardsList.includes(c.key) &&
            !c.used &&
            c.attribut &&
            attributs.includes(c.attribut)
    ).filter((c, index, self) => index === self.findIndex((card) => card.key === c.key))

    const player = roomState.players.find((p) => p.userId === otherPlayerId)

    if (deck && opponentsBakugans.length > 0 && cards && cards.length > 0 && player && player.usable_abilitys > 0) {

        const request: gateCardAdditionalRequest = {
            type: 'SELECT_ABILITY_CARD',
            data: cards.map((card) => ({
                key: card.key,
                description: card.description,
                image:
                    [...AbilityCardsList, ...ExclusiveAbilitiesList]
                        .find((ability) => ability.key === card.key)
                        ?.image || '',
                name: card.name
            })),
            message: `Mine Ghost : Select one ability card`,
            skipable: true,
            target: otherPlayerId
        }

        return request
    }

    return onNoCard()
}

export type ResolveMineGhostAdditionalRequestParams = {
    resolution: resolutionGateCardType
    roomState: stateType
    slotOfGate: portalSlotsTypeElement
    otherPlayerId: string
    onMainEffect: () => null | gateCardAdditionalRequest
}

export function ResolveTrapCardAdditionalRequest({
    resolution,
    roomState,
    slotOfGate,
    onMainEffect
}: ResolveMineGhostAdditionalRequestParams): null | gateCardAdditionalRequest {

    if (resolution.data.type !== 'SELECT_ABILITY_CARD') {
        return onMainEffect()
    }

    const bakugans = slotOfGate.bakugans

    const opponentsBakugan = bakugans.find(
        (b) => b.userId !== slotOfGate.portalCard?.userId
    )

    if (!opponentsBakugan) {
        return onMainEffect()
    }

    const { cardOwnerId, card } = resolution.data

    const abilityCardUsed = roomState.decksState
        .find((d) => d.userId === cardOwnerId)
        ?.abilities.find(
            (a) => a.key === card.key && a.used === false
        )

    const cardData = [
        ...AbilityCardsList,
        ...ExclusiveAbilitiesList
    ].find((c) => c.key === card.key)

    const activeCardAnimation: AnimationDirectivesTypes = {
        type: 'ACTIVE_ABILITY_CARD',
        data: {
            card: card.key,
            attribut:
                cardData?.attribut || opponentsBakugan.attribut
        },
        resolve: false,
        message: [
            {
                text: `Ability Card Activate : ${card.name}`,
                userName: GetUserName({
                    roomData: roomState,
                    userId: cardOwnerId
                }),
                turn: roomState.turnState.turnCount
            },
            {
                text: `${card.description}`,
                turn: roomState.turnState.turnCount,
                description: true
            }
        ]
    }

    roomState.animations.push(activeCardAnimation)

    cardData?.onActivate({
        roomState,
        roomId: roomState.roomId,
        slot: resolution.slot,
        userId: opponentsBakugan.userId,
        bakuganKey: opponentsBakugan.key
    })

    if (abilityCardUsed) {
        abilityCardUsed.used = true
    }

    const player = roomState.players.find((p) => p.userId === cardOwnerId)

    if (player) {
        player.usable_abilitys = player.usable_abilitys - 1
        NewAdditionnalMessage({
            roomState,
            text: `${player.username} has ${player.usable_abilitys} ability card(s) left`
        })
    }

    const ownerBakugans = bakugans.filter(
        (b) => b.userId === slotOfGate.portalCard?.userId
    )

    if (slotOfGate.state.canceled === true) {

        if (ownerBakugans.length === 0) {
            RemoveGateCardDirectiveAnimation({
                animations: roomState.animations,
                slot: slotOfGate,
                roomState
            })

            ResetSlot(slotOfGate)

            roomState.turnState.set_new_bakugan = true
            roomState.turnState.set_new_gate = true

            CheckBattleStillInProcess(roomState)
            CheckBattle({
                roomState
            })
        } else {
            CheckBattle({
                roomState
            })
        }

        return {
            type: 'TURN_ACTION_LAUNCHER'
        }
    }

    return onMainEffect()
}