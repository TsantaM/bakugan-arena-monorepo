import type { stateType } from '../type/type-index.js'
import { OpenGateCardActionRequest, SelectGateCardActionRequest, SetBakuganActionRequest, SetGateCardActionRequest, UseAbilityCardActionRequest } from './action-request-functions/index.js'

export function CreateActionRequestFunction({ roomState }: { roomState: stateType }) {

    if (!roomState) return

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
    
}