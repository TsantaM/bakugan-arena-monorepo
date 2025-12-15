import type { ActionType } from '../../type/actions-serveur-requests'
import type { stateType } from '../../type/room-types'
import { SetBakuganFilters } from '../filters/set-bakugan-filters'

export function SetBakuganActionRequest({ roomState }: { roomState: stateType }) {
    if (!roomState) return

    const activePlayer = roomState.decksState.find((deck) => deck.userId === roomState.turnState.turn)
    const inactivePlayer = roomState.decksState.find((deck) => deck.userId !== roomState.turnState.turn)
    const battleState = roomState.battleState
    const turnCount = roomState.turnState.turnCount
    const request = roomState.ActivePlayerActionRequest

    if (!activePlayer) return

    const bankugansAndSlots = SetBakuganFilters({
        opponentDeck: inactivePlayer,
        playersDeck: activePlayer,
        slots: roomState.protalSlots,
        userId: activePlayer.userId
    })

    const SlotsWithUsersBakugan = roomState.protalSlots.filter((slot) => slot.bakugans.some((bakugan) => bakugan.userId === activePlayer.userId))
    const SlotsWithBakugans = roomState.protalSlots.filter((slot) => slot.bakugans.length > 0)

    if (!bankugansAndSlots?.usableBakugans) return

    const setBakuganRequest: ActionType = {
        type: 'SET_BAKUGAN',
        data: {
            bakugans: bankugansAndSlots.usableBakugans.map((b) => ({
                attribut: b!.attribut,
                currentPower: b!.currentPowerLevel,
                image: b!.image,
                key: b!.key,
                name: b!.name
            })),
            setableSlots: bankugansAndSlots.usableSlots.map((slot) => slot.id)
        }
    }

    if (turnCount > 0 && (!battleState.battleInProcess || battleState.paused)) {
        if (SlotsWithUsersBakugan.length === 0 || SlotsWithBakugans.length === 0) {
            request.actions.mustDo.push(setBakuganRequest)
        } else {
            request.actions.mustDoOne.push(setBakuganRequest)
        }
    } else {
        return
    }


}

// Cette fonction n'est pas utilisée dans la détermination des action possibles ou obligatoires pendant un tour, mais c'est surtout dans les effets de cartes qui obligent le ou les joueur(s) à choisir un bakugan (donc pour le moment je )

// export function SelectBakuganActionRequest({ roomState }: { roomState: stateType }) {
//     if (!roomState) return
//     const activePlayer = roomState.decksState.find((deck) => deck.userId === roomState.turnState.turn)
//     const inactivePlayer = roomState.decksState.find((deck) => deck.userId !== roomState.turnState.turn)
//     const battleState = roomState.battleState
//     const turnCount = roomState.turnState.turnCount
//     const request = roomState.ActivePlayerActionRequest

//     if (!activePlayer) return

//     const bankugansAndSlots = SetBakuganFilters({
//         opponentDeck: inactivePlayer,
//         playersDeck: activePlayer,
//         slots: roomState.protalSlots,
//         userId: activePlayer.userId
//     })
// }