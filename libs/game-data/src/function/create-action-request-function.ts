import type { stateType } from '../type/room-types'
import { OpenGateCardActionRequest } from './action-request-functions/open-gate-card-action-request'
import { SetBakuganActionRequest } from './action-request-functions/set-bakugan-action-requests'
import { SelectGateCardActionRequest, SetGateCardActionRequest } from './action-request-functions/set-gate-gard-action-request'
import { UseAbilityCardActionRequest } from './action-request-functions/use-ability-card-action-request'

export function CreateActionRequestFunction({ roomState }: { roomState: stateType }) {

    if (!roomState) return
    const turnState = roomState.turnState
    const players = roomState.players

    const active = roomState.ActivePlayerActionRequest
    const inactive = roomState.InactivePlayerActionRequest

    active.actions.mustDo = []
    active.actions.mustDoOne = []
    active.actions.optional = []

    inactive.actions.mustDo = []
    inactive.actions.mustDoOne = []
    inactive.actions.optional = []

    SetGateCardActionRequest({ roomState })
    SelectGateCardActionRequest({ roomState })
    SetBakuganActionRequest({ roomState })
    UseAbilityCardActionRequest({ roomState })
    OpenGateCardActionRequest({ roomState })

    const mustDoEmpty = active.actions.mustDo.length === 0
    const mustDoOneEmpty = active.actions.mustDoOne.length === 0
    const optionnalEmpty = active.actions.optional.length === 0

    // Condition : un des deux DOIT être rempli
    const actionsRequired = roomState.turnState.turnCount > 0
    // && (!roomState.battleState.battleInProcess || roomState.battleState.paused)

    if (actionsRequired && mustDoEmpty && mustDoOneEmpty && optionnalEmpty) {
        turnState.previous_turn = turnState.turn
        turnState.turn = players.find(p => p.userId !== turnState.turn)?.userId ?? turnState.turn

        active.actions.mustDo = []
        active.actions.mustDoOne = []
        active.actions.optional = []

        inactive.actions.mustDo = []
        inactive.actions.mustDoOne = []
        inactive.actions.optional = []

        CreateActionRequestFunction({ roomState })
    }

}