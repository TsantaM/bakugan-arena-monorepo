import type { ActionRequestAnswerType, ActionType, SelectableAbilityCardAction } from "@bakugan-arena/game-data/src/type/actions-serveur-requests"

export function SelectAbilityCard({ userId, SelectedActions, actions }: {
    userId: string,
    SelectedActions: ActionRequestAnswerType
    actions: ActionType[]
}) {

    const SelectAbilityCardAction = SelectedActions.find((action) => action.type === 'SELECT_ABILITY_CARD')
    const SelectablesAbilityCards = actions.find((action) => action.type === 'SELECT_ABILITY_CARD')?.data

    if (!SelectAbilityCardAction) return
    if (!SelectablesAbilityCards) return

    const Abilities: SelectableAbilityCardAction = {
        onBoardBakugans: SelectablesAbilityCards.map((data) => data.onBoardBakugans).flat(),
    }

    const merged = [Abilities.onBoardBakugans].flat()
    const cards = merged.map(bakugan => bakugan.abilities).flat();

    const cardsToSelect = document.querySelectorAll('.card-selecter');
    cardsToSelect.forEach(card => {
        card.addEventListener('click', () => {
            const selectedCard = cards.find(c => c.key === card.getAttribute('data-key'))
            const onBoardBakugans = merged.find((bakugan) => bakugan.abilities.some((ability) => ability.key === selectedCard?.key))
            if (!selectedCard) return
            if (!onBoardBakugans) return

            const newData = {
                bakuganId: onBoardBakugans.bakuganKey,
                key: selectedCard.key,
                slot: onBoardBakugans.slot,
                userId: userId
            }


            if (SelectAbilityCardAction.data && SelectAbilityCardAction.data.key === selectedCard.key) {
                SelectAbilityCardAction.data = undefined
            } else {
                SelectAbilityCardAction.data = newData
            }

            console.log(SelectAbilityCardAction)
        })
    })
}