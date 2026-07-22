import { AbilityCardsList, AnimationDirectivesTypes, bakuganOnSlot, ExclusiveAbilitiesList, GetUserName, type resolutionGateCardType, type stateType } from "../../index.js";
import { pushReplayAnimation } from "../replay/push-replay-animation.js";
import { NewAdditionnalMessage } from "../new-additional-message.js";


export function AdditionalEffectActiveCard({ resolution, roomState, opponentsBakugan }: { roomState: stateType, resolution: resolutionGateCardType, opponentsBakugan: bakuganOnSlot }) {

    if(resolution.data.type !== 'SELECT_ABILITY_CARD') return

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
                key: 'ability_activate',
                params: {
                    abilityKey: card.key,
                },
                userName: GetUserName({
                    roomData: roomState,
                    userId: cardOwnerId
                }),
                turn: roomState.turnState.turnCount
            },
            {
                key: 'ability_description',
                params: { abilityKey: card.key },
                turn: roomState.turnState.turnCount,
                description: true
            }
        ]
    }

    roomState.animations.push(activeCardAnimation)
    pushReplayAnimation(roomState, activeCardAnimation)

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
            key: 'abilities_remaining',
            params: {
                username: player.username,
                count: player.usable_abilitys,
            },
        })
    }

}