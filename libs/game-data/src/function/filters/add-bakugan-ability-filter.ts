import { type deckType } from '../../type/room-types'

export function AddBakuganAbilityFilter({decksState, userId} : {decksState: deckType[] | undefined , userId: string}) {

        if(!decksState) return

        const addableBakugans = decksState.find((d) => d.userId === userId)?.bakugans.filter((b) => !b?.bakuganData.elimined && !b?.bakuganData.onDomain)

        return {
            addableBakugans
        }
}