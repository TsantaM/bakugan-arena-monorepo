import { portalSlotsTypeElement, slots_id, stateType,  } from "./room-types"
import { bakuganToMoveType } from './game-data-types'

export type activeGateCardProps = { roomId: string, gateId: string, slot: slots_id, userId: string }
export type setBakuganProps = { roomId: string, bakuganKey: string, slot: string, userId: string }
export type setGateCardProps = { roomId: string, gateId: string, slot: string, userId: string }
export type useAbilityCardProps = { roomId: string, abilityId: string, slot: slots_id, userId: string, bakuganKey: string, target_slot: slots_id | '', slot_to_move: slots_id | '', target: string | '', slotToDrag: slots_id | '', bakuganToAdd: string, bakuganToMove: bakuganToMoveType | undefined, destination: slots_id | '', zone?: slots_id | '' }
