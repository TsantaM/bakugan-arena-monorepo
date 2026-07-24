import { Bakugans } from "../../battle-brawlers/bakugans.js"
import { pushReplayAnimation } from "../replay/push-replay-animation.js";
import { AnimationDirectivesTypes, Message } from "../../type/animations-directives.js"
import { bakuganOnSlot, onSlotStatutType, stateType } from "../../type/room-types.js"
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

function getProtectionField(
    bakugan: bakuganOnSlot,
    protectionType: ProtectCardEffectType['protectionType'],
): onSlotStatutType {
    if (protectionType === 'GATE') return bakugan.statut.protectedAgainstGate
    if (protectionType === 'ABILITY') return bakugan.statut.protectedAgainstAbility
    return bakugan.statut.protected
}

function setProtectionField(
    bakugan: bakuganOnSlot,
    protectionType: ProtectCardEffectType['protectionType'],
    value: onSlotStatutType,
) {
    if (protectionType === 'GATE') {
        bakugan.statut.protectedAgainstGate = value
    } else if (protectionType === 'ABILITY') {
        bakugan.statut.protectedAgainstAbility = value
    } else {
        bakugan.statut.protected = value
    }
}

export function ProtectCardEffect({ bakugan, cardKey, origin, roomState, protectionType }: ProtectCardEffectType) {
    const check = getProtectionField(bakugan, protectionType)

    if (check) {
        NewAdditionnalMessage({
            roomState: roomState,
            key: 'bakugan_already_protected_by',
            params: {
                name: Bakugans[bakugan.key].name,
                ...protectionSourceParams(check),
            },
        })
        return
    }

    setProtectionField(bakugan, protectionType, {
        check: true,
        key: cardKey,
        origin: origin,
    })

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

export function RemoveProtectionCardEffect({ bakugan, cardKey, origin, protectionType, roomState }: ProtectCardEffectType) {
    const check = getProtectionField(bakugan, protectionType)

    if (check && check.key === cardKey && check.origin === origin) {
        setProtectionField(bakugan, protectionType, false)

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
        return
    }

    NewAdditionnalMessage({
        roomState: roomState,
        key: 'bakugan_not_protected',
        params: { name: Bakugans[bakugan.key].name },
    })
}
