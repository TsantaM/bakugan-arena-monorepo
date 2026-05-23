import { AbilityCardsList, ExclusiveAbilitiesList, type attribut, type gateCardAdditionalRequest, type portalSlotsTypeElement, type stateType } from "../../index.js"

type Props = {
    roomState: stateType
    cardsList: string[],
    slotOfGate: portalSlotsTypeElement
}

export function GetUsableCardsInDeck({ roomState, cardsList, slotOfGate }: Props) : gateCardAdditionalRequest | null {

    const otherPlayerId = roomState?.players.find(
        (p) => p.userId !== slotOfGate?.portalCard?.userId
    )?.userId

    const bakugans = slotOfGate.bakugans

    const opponentsBakugans = bakugans.filter(
        (b) => b.userId !== slotOfGate.portalCard?.userId
    )

    const attributs = opponentsBakugans.map((b) => b.attribut)

    const deck = roomState.decksState.find(
        (d) => d.userId === otherPlayerId
    )

    if (!deck) return null

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

    return null

}