import type { slots_id } from "./room-types.js"
import type { bakuganToMoveType } from './game-data-types.js'
import { Server } from "socket.io"

export type activeGateCardProps = { roomId: string, gateId: string, slot: slots_id, userId: string, io?: Server }
export type setBakuganProps = { roomId: string, bakuganKey: string, slot: string, userId: string }
export type setGateCardProps = { roomId: string, gateId: string, slot?: string, userId: string }
export type useAbilityCardProps = { roomId: string, abilityId: string, slot: slots_id, userId: string, bakuganKey: string }
export type useAbilityCardPropsFront = {
    roomId: string, abilityId: string, userId: string, bakuganKey: string, target_slot: slots_id | '', slot_to_move: slots_id | '', target: string | '', slotToDrag: slots_id | '', bakuganToAdd: string, bakuganToMove: bakuganToMoveType | undefined, destination: slots_id | '', zone?: slots_id | ''

}
export type turnCountSocketProps = {
    turnCount: number,
    battleTurn?: number
}
export type chalengeSomeoneSocketProps = {
    userId: string;
    deckId: string;
    targetId: string;
    chalengerName: string;
}

export type chalengeAcceptSocketProps = {
    userId: string | undefined;
    deckId: string;
    chalengerId: string;
}