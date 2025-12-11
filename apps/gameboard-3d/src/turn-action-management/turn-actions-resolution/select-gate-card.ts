import type { ActionRequestAnswerType, ActionType } from "@bakugan-arena/game-data/src/type/actions-serveur-requests";

export function SelectGateCard({ userId, SelectedActions, actions }: {
    userId: string,
    SelectedActions: ActionRequestAnswerType
    actions: ActionType[]
}) {
    const SelectGateCardAction = SelectedActions.find((action) => action.type === 'SELECT_GATE_CARD')
    const SelectablesCards = actions.find((action) => action.type === 'SELECT_GATE_CARD')?.data

    if (!SelectGateCardAction) return
    if (!SelectablesCards) return


    const cardsToSelect = document.querySelectorAll('.card-selecter');
    cardsToSelect.forEach(card => {
        card.addEventListener('click', () => {
            const data = SelectablesCards.find(c => c.key === card.getAttribute('data-key'));
            console.log('Selected Gate Card:', data);
            if (!data) return
            SelectGateCardAction.data = {
                key: data.key,
                userId: userId
            }
            console.log(SelectGateCardAction)
        })
    })

}