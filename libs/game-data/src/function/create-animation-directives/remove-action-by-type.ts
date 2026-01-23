import { ActionType, ActivePlayerActionRequestType, InactivePlayerActionRequestType, slots_id } from "../../type/type-index.js"

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
  let optional = removeByType(request.actions.optional, typeToRemove)
  let mustDoOne = request.actions.mustDoOne

  // Traitement spécifique à mustDoOne

  if (request.actions.mustDoOne.some((action) => action.type === typeToRemove)) {
    mustDoOne = removeByType(request.actions.mustDoOne, typeToRemove)
    optional = [...optional, mustDoOne].flat()
    mustDoOne = []
  }


  return {
    ...request,
    actions: {
      mustDo,
      mustDoOne,
      optional: optional,
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