import { Bakugans } from "../../battle-brawlers/bakugans.js"
import { GateCards } from "../../battle-brawlers/gate-gards.js"
import { AbilityCards, ExclusiveAbilities } from "../../battle-brawlers/index.js"
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

export function ProtectCardEffect({ bakugan, cardKey, origin, roomState, protectionType }: ProtectCardEffectType) {

    const check = protectionType === 'GATE' ? bakugan.statut.protectedAgainstGate : protectionType === 'ABILITY' ? bakugan.statut.protectedAgainstAbility : bakugan.statut.protected

    if (check) {
        const text: string = `${Bakugans[bakugan.key].name} is already protected by ${check.origin === 'GATE'
            ? GateCards[check.key].name
            : AbilityCards[check.key].name || ExclusiveAbilities[check.key].name
            }`;

        NewAdditionnalMessage({
            roomState: roomState,
            text: text,
        })

    } else {
        bakugan.statut.protectedAgainstAbility = {
            check: true,
            key: cardKey,
            origin: origin
        }

        const text = `${Bakugans[bakugan.key].name} is protected against ${protectionType === 'GATE' ? 'gate cards' : protectionType === 'ABILITY' ? 'abilities' : 'gate cards and abilities'} `

        const message: Message = {
            text: text,
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

    }




}

export function RemoveProtectionCardEffect({ bakugan, cardKey, origin, protectionType, roomState }: ProtectCardEffectType) {

    const check = protectionType === 'GATE' ? bakugan.statut.protectedAgainstGate : protectionType === 'ABILITY' ? bakugan.statut.protectedAgainstAbility : bakugan.statut.protected

    if (check && check.key === cardKey && check.origin === origin) {

        if(origin === 'GATE') {
            bakugan.statut.protectedAgainstGate = false
        } else if(origin === 'ABILITY') {
            bakugan.statut.protectedAgainstAbility = false
        } else {
            bakugan.statut.protected = false
        }

        const message: Message = {
            text: `${Bakugans[bakugan.key].name} is not protected anymore`,
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

    } else {
        const text: string = `${Bakugans[bakugan.key].name} isn't protected.`;

        NewAdditionnalMessage({
            roomState: roomState,
            text: text,
        })
    }

}