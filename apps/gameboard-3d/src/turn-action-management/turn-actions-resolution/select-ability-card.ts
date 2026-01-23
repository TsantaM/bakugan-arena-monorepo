import type { ActionRequestAnswerType, ActionType } from "@bakugan-arena/game-data"

export function SelectAbilityCard({ userId, SelectedActions, actions }: {
    userId: string,
    SelectedActions: ActionRequestAnswerType
    actions: ActionType[]
}) {

    const SelectAbilityCardAction = SelectedActions.find((action) => action.type === 'SELECT_ABILITY_CARD')
    const SelectablesAbilityCards = actions.find((action) => action.type === 'SELECT_ABILITY_CARD')?.data

    const onBoardBakugans = actions.find(a => a.type === 'USE_ABILITY_CARD')?.data
    if (!onBoardBakugans) return

    const bakugans = onBoardBakugans.map((bakugan) => bakugan)


    const Abilities = [...new Map(
        onBoardBakugans
            .flatMap(b => b.abilities)
            .map(card => [card.key, card])
    ).values()]

    if (!SelectAbilityCardAction) return
    if (!SelectablesAbilityCards) return

    const selectOne = document.getElementById('stack-selecte-one')
    if (!selectOne) return

    const cardsToSelect = document.querySelectorAll('.card-selecter');
    cardsToSelect.forEach(card => {
        card.addEventListener('click', () => {
            const selectedCard = Abilities.find(c => c.key === card.getAttribute('data-key'))
            const bakugan = bakugans.find((bakugan) => bakugan.abilities.some((ability) => ability.key === selectedCard?.key))
            if(!bakugan) return
            if (!selectedCard) return
            if (!onBoardBakugans) return

            const newData = {
                bakuganId: bakugan.bakuganKey,
                key: selectedCard.key,
                slot: bakugan.slot,
                userId: userId
            }


            if (SelectAbilityCardAction.data && SelectAbilityCardAction.data.key === selectedCard.key) {
                SelectAbilityCardAction.data = undefined
            } else {
                SelectAbilityCardAction.data = newData
            }

        })
    })
}