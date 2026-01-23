import type { ActionRequestAnswerType, ActionType } from "@bakugan-arena/game-data"

export function SelectBakugan({ userId, SelectedActions, actions }: {
    userId: string,
    SelectedActions: ActionRequestAnswerType
    actions: ActionType[]
}) {

    const SelectBakuganAction = SelectedActions.find((action) => action.type === 'SELECT_BAKUGAN')
    const SelectablesBakugans = actions.find((action) => action.type === 'SELECT_BAKUGAN')?.data

    if (!SelectBakuganAction) return
    if (!SelectablesBakugans) return

    const bakugansSprites = document.querySelectorAll('.image-bakugan-selecter-container');
    bakugansSprites.forEach(bakugan => {
        bakugan.addEventListener('click', () => {
            const data = SelectablesBakugans.find(b => b.key === bakugan.getAttribute('data-key'));

            if(!data) return

            if( SelectBakuganAction.data && SelectBakuganAction.data.key === data.key) {
                SelectBakuganAction.data = undefined
            } else {
                SelectBakuganAction.data = {
                    key: data.key,
                    userId: userId
                }
            }


        })
    })

}