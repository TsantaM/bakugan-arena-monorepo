import { ActionType, ActivePlayerActionRequestType, InactivePlayerActionRequestType } from "../../type/actions-serveur-requests"
import { slots_id } from "../../type/room-types"

const removeByType = (actions: ActionType[], typeToRemove: ActionType['type']) => {
  const result: ActionType[] = []

  for (const action of actions) {
    if (action.type !== typeToRemove) {
      result.push(action)
    }
  }

  return result
}



export function removeActionByType<
  T extends ActionType['type']
>(
  request: ActivePlayerActionRequestType | InactivePlayerActionRequestType,
  typeToRemove: T,
): ActivePlayerActionRequestType | InactivePlayerActionRequestType {

  const mustDo = removeByType(request.actions.mustDo, typeToRemove)
  const optional = removeByType(request.actions.optional, typeToRemove)

  // Traitement spécifique à mustDoOne
  const originalMustDoOne = request.actions.mustDoOne

  let mustDoOne: ActionType[] = []
  let newOptional = [...optional]

  let removedFromMustDoOne = false

  for (const action of originalMustDoOne) {
    if (action.type === typeToRemove) {
      removedFromMustDoOne = true
    } else {
      mustDoOne.push(action)
    }
  }

  // Si on a supprimé une action depuis mustDoOne,
  // alors les restantes vont dans optional
  if (removedFromMustDoOne) {
    newOptional = [...newOptional, ...mustDoOne]
    mustDoOne = []
  }

  return {
    ...request,
    actions: {
      mustDo,
      mustDoOne,
      optional: newOptional,
    }
  }
}

export function addSlotToSetBakugan(slot: slots_id, request: ActivePlayerActionRequestType | InactivePlayerActionRequestType): ActivePlayerActionRequestType | InactivePlayerActionRequestType {

  const addSlot = (
    actions: ActionType[],
  ): ActionType[] => {
    const action = actions.find(
      (action): action is Extract<ActionType, { type: 'SET_BAKUGAN' }> =>
        action.type === 'SET_BAKUGAN'
    )

    if (action) {
      action.data.setableSlots.push(slot)
    }

    return actions
  }

  return {
    ...request,
    actions: {
      mustDo: addSlot(request.actions.mustDo),
      mustDoOne: addSlot(request.actions.mustDoOne),
      optional: addSlot(request.actions.optional)
    }
  }
}