import { Bakugans } from "../../battle-brawlers/bakugans.js"
import { pushReplayAnimation } from "../replay/push-replay-animation.js";
import { AnimationDirectivesTypes, Message } from "../../type/animations-directives.js"
import { bakuganOnSlot, stateType } from "../../type/room-types.js"
import { NewAdditionnalMessage } from "../new-additional-message.js"

type ProtectCardEffectType = {
    roomState: stateType,
    bakugan: bakuganOnSlot,
    cardKey: string,
    origin: 'GATE' | 'ABILITY',
    protectionType: 'ABILITY' | 'GATE' | 'BOTH'
}

function protectionSourceParams(check: { key: string; origin: 'GATE' | 'ABILITY' }): Record<string, string | number> {
    return check.origin === 'GATE'
        ? { gateKey: check.key }
        : { abilityKey: check.key }
}

export function ProtectCardEffect({ bakugan, cardKey, origin, roomState, protectionType }: ProtectCardEffectType) {

    const check = protectionType === 'GATE' ? bakugan.statut.protectedAgainstGate : protectionType === 'ABILITY' ? bakugan.statut.protectedAgainstAbility : bakugan.statut.protected

    if (check) {
        NewAdditionnalMessage({
            roomState: roomState,
            key: 'bakugan_already_protected_by',
            params: {
                name: Bakugans[bakugan.key].name,
                ...protectionSourceParams(check),
            },
        })

    } else {
        bakugan.statut.protectedAgainstAbility = {
            check: true,
            key: cardKey,
            origin: origin
        }

        const key =
            protectionType === 'GATE'
                ? 'bakugan_protected_against_gates'
                : protectionType === 'ABILITY'
                    ? 'bakugan_protected_against_abilities'
                    : 'bakugan_protected_against_both'

        const message: Message = {
            key,
            params: { name: Bakugans[bakugan.key].name },
            turn: roomState.turnState.turnCount,
            description: false
        }

        const animation: AnimationDirectivesTypes = {
            type: 'ACTIVE_PROTECTION',
            resolve: false,
            data: {
                cardKey: cardKey,
                origin: origin,
                bakugan: bakugan
            },
            message: [message]
        }

        roomState.animations.push(animation)
        pushReplayAnimation(roomState, animation)


    }




}

export function RemoveProtectionCardEffect({ bakugan, cardKey, origin, protectionType, roomState }: ProtectCardEffectType) {

    const check = protectionType === 'GATE' ? bakugan.statut.protectedAgainstGate : protectionType === 'ABILITY' ? bakugan.statut.protectedAgainstAbility : bakugan.statut.protected

    if (check && check.key === cardKey && check.origin === origin) {

        if (origin === 'GATE') {
            bakugan.statut.protectedAgainstGate = false
        } else if (origin === 'ABILITY') {
            bakugan.statut.protectedAgainstAbility = false
        } else {
            bakugan.statut.protected = false
        }

        const message: Message = {
            key: 'bakugan_protection_ended',
            params: { name: Bakugans[bakugan.key].name },
            turn: roomState.turnState.turnCount,
            description: false,
        }

        const animation: AnimationDirectivesTypes = {
            type: 'REMOVE_PROTECTION',
            data: {
                bakugan: bakugan,
                cardKey: cardKey,
                origin: origin
            },
            message: [message],
            resolve: false
        }

        roomState.animations.push(animation)
        pushReplayAnimation(roomState, animation)

    } else {
        NewAdditionnalMessage({
            roomState: roomState,
            key: 'bakugan_not_protected',
            params: { name: Bakugans[bakugan.key].name },
        })
    }

}
