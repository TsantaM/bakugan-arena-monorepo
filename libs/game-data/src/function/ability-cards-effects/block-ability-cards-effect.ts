import { AbilityCards, ExclusiveAbilities } from "../../battle-brawlers/index.js"
import { attribut, slots_id, stateType } from "../../type/type-index.js"
import { NewAdditionnalMessage } from "../new-additional-message.js"

type AbilityBlockCard = {
    key: string
    attribut?: attribut
}

export const BlockAbilityCardsEffect = ({
    roomState,
    userId,
    bakuganKey,
    slot,
    card,
    turns,
}: {
    roomState: stateType
    userId: string
    bakuganKey: string
    slot: slots_id
    card: AbilityBlockCard
    turns: number
}) => {
    const slotOfGate = roomState.protalSlots.find((s) => s.id === slot)
    if (!slotOfGate) return

    const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)
    if (!user) return

    roomState.turnState.ability_card_block = {
        blocked: true,
        reason: {
            attribut: card.attribut ? card.attribut : user.attribut,
            bakugan: user,
            key: card.key,
            slot: slot
        },
        turn: turns < 0 ? 0 : turns
    }

    const AllAbilities = {
        ...AbilityCards,
        ...ExclusiveAbilities
    }

    NewAdditionnalMessage({
        roomState: roomState,
        text: `Abilities are blocked for ${turns} ${turns === 1 ? 'turn' : 'turns'} by ${AllAbilities[card.key]?.name}`
    })

}

export const RemoveAbilityCardsBlockEffect = ({
    roomState,
    card,
}: {
    roomState: stateType
    card: AbilityBlockCard
}) => {
    const { blocked, reason } = roomState.turnState.ability_card_block
    if (!blocked) return
    if (!reason) return
    if (reason.key !== card.key) return
    if (card.attribut && reason.attribut !== card.attribut) return

    roomState.turnState.ability_card_block = {
        blocked: false,
        reason: null,
        turn: 0
    }

    NewAdditionnalMessage({
        roomState: roomState,
        text: `Abilities are unblocked`
    })

}
