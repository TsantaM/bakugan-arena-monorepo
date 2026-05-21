import { AbilityCardsList, AnimationDirectivesTypes, CancelGateCardAbilities, CheckBattle, CheckBattleStillInProcess, ElimineBakuganEffect, ExclusiveAbilitiesList, gateCardAdditionalRequest,  GetUserName, RemoveGateCardDirectiveAnimation, ResetSlot, Slots, type gateCardType } from "../../../index.js";
import { GateCardImages } from "../../../store/gate-card-images.js";

export const MineFantome: gateCardType = {
    key: 'mine-fantome',
    name: 'Mine Ghost',
    maxInDeck: 1,
    description: `When two ore Bakugan stand on the Card, no matter wich side they are on, they both lose`,
    image: GateCardImages.command,
    onOpen: ({ roomState, slot }) => {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        const otherPlayerId = roomState?.players.find((p) => p.userId !== slotOfGate?.portalCard?.userId)?.userId

        if (roomState && slotOfGate && slotOfGate.portalCard !== null && slotOfGate.state.open === false && slotOfGate.state.canceled === false && otherPlayerId) {
            slotOfGate.state.open = true
            const bakugans = slotOfGate.bakugans

            const opponentsBakugans = bakugans.filter((b) => b.userId !== slotOfGate.portalCard?.userId)
            const attributs = opponentsBakugans.map((b) => b.attribut)
            const deck = roomState.decksState.find((d) => d.userId === otherPlayerId)
            const cards = deck?.abilities.filter((c) => CancelGateCardAbilities.includes(c.key) && !c.used && (c.attribut && attributs.includes(c.attribut)))

            if (deck && opponentsBakugans.length > 0 && cards && cards.length > 0) {

                const request: gateCardAdditionalRequest = {
                    type: 'SELECT_ABILITY_CARD',
                    data: cards.map((card) => ({
                        key: card.key,
                        description: card.description,
                        image: [...AbilityCardsList, ...ExclusiveAbilitiesList].find((ability) => ability.key === card.key)?.image || '',
                        name: card.name
                    })),
                    message: `Mine Ghost : Select one ability card`,
                    skipable: true,
                    target: otherPlayerId
                }

                // console.log('request gate card', request.type)

                return request

            } else {
                bakugans.forEach((bakugan) => {
                    ElimineBakuganEffect({ bakugan: bakugan, roomState: roomState, gateCardProtection: true })
                })

                roomState.turnState.turn = slotOfGate.portalCard.userId
                roomState.turnState.previous_turn = otherPlayerId

                RemoveGateCardDirectiveAnimation({
                    animations: roomState.animations,
                    slot: slotOfGate,
                    roomState: roomState
                })

                ResetSlot(slotOfGate)
                roomState.turnState.set_new_bakugan = true
                roomState.turnState.set_new_gate = true
                CheckBattleStillInProcess(roomState)
                CheckBattle({
                    roomState: roomState
                })
                return {
                    type: 'TURN_ACTION_LAUNCHER'
                }
            }

        } else {
            return null
        }

    },
    onAdditionalRequest({ resolution, roomState }) {

        const slotOfGate = roomState?.protalSlots[Slots.indexOf(resolution.slot)]
        const bakugans = slotOfGate.bakugans
        const opponentsBakugans = bakugans.filter((b) => b.userId !== slotOfGate.portalCard?.userId)[0]
        const otherPlayerId = roomState?.players.find((p) => p.userId !== slotOfGate?.portalCard?.userId)?.userId

        if (roomState && slotOfGate && slotOfGate.portalCard !== null && otherPlayerId) {
            if (resolution.data.type !== 'SELECT_ABILITY_CARD') {

                bakugans.forEach((bakugan) => {
                    ElimineBakuganEffect({ bakugan: bakugan, roomState: roomState, gateCardProtection: true })
                })

                roomState.turnState.turn = slotOfGate.portalCard.userId
                roomState.turnState.previous_turn = otherPlayerId

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
                    roomState: roomState
                })
                return {
                    type: 'TURN_ACTION_LAUNCHER'
                }

            } else {

                const { cardOwnerId, card } = resolution.data
                const abilityCardUsed = roomState.decksState.find((d) => d.userId === cardOwnerId)?.abilities.find((a) => a.key === card.key && a.used === false)

                if (abilityCardUsed) {
                    // FR: Marquer la carte capacité comme utilisée
                    // ENG: Mark the ability card as used
                    abilityCardUsed.used = true
                }

                const cardData = [...AbilityCardsList, ...ExclusiveAbilitiesList].flat().find((c) => c.key === card.key)

                const activeCardAnimation: AnimationDirectivesTypes = {
                    type: 'ACTIVE_ABILITY_CARD',
                    data: {
                        card: card.key,
                        attribut: cardData?.attribut ? cardData.attribut : opponentsBakugans.attribut
                    },
                    resolve: false,
                    message: [{
                        text: `Ability Card Activate : ${card.name}`,
                        userName: GetUserName({
                            roomData: roomState,
                            userId: cardOwnerId,
                        }),
                        turn: roomState.turnState.turnCount
                    }, {
                        text: `${card.description}`,
                        turn: roomState.turnState.turnCount,
                        description: true
                    }]
                }

                roomState.animations.push(activeCardAnimation)

                // console.log('card key', cardData?.key)
                cardData?.onActivate({
                    roomState: roomState,
                    roomId: roomState.roomId,
                    slot: resolution.slot,
                    userId: opponentsBakugans.userId,
                    bakuganKey: opponentsBakugans.key
                })

                // console.log('slot state', slotOfGate.state.canceled)
                const ownerBakugans = bakugans.filter((b) => b.userId === slotOfGate.portalCard?.userId)

                if (slotOfGate.state.canceled === true) {
                    if (ownerBakugans.length === 0) {
                        CheckBattle({
                            roomState: roomState
                        })
                    } else {
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
                            roomState: roomState
                        })
                    }
                } else {
                    bakugans.forEach((bakugan) => {
                        ElimineBakuganEffect({ bakugan: bakugan, roomState: roomState, gateCardProtection: true })
                    })

                    roomState.turnState.turn = slotOfGate.portalCard.userId
                    roomState.turnState.previous_turn = otherPlayerId

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
                        roomState: roomState
                    })
                }

                return {
                    type: 'TURN_ACTION_LAUNCHER'
                }
            }
        }

        return {
            type: 'TURN_ACTION_LAUNCHER'
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