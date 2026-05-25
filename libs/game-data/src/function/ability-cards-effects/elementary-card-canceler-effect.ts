import { AbilityCardsList, Bakugans, ExclusiveAbilitiesList } from "../../battle-brawlers/index.js";
import { Slots } from "../../store/slots.js";
import { AbilityCardsActions, AnimationDirectivesTypes, slots_id, stateType } from "../../type/type-index.js";
import { CancelAbilityCardEffect } from "./cancel-ability-card-effect.js";

export function ElementaryCardCancelerEffect({ roomState, userId, slot, cardToCancel }: {
    roomState: stateType;
    userId: string;
    slot: slots_id;
    cardToCancel?: {
        cardKey: string;
        bakuganKey: string;
        userId: string;
        slot: slots_id;
    };
}): null | AbilityCardsActions {
    if (!roomState) return null
    const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)

    if (cardToCancel) {
        const slotTarget = roomState.protalSlots[Slots.indexOf(cardToCancel.slot)]
        const ability = slotTarget.activateAbilities.find((a) => a.key === cardToCancel.cardKey && a.userId === cardToCancel.userId && a.bakuganKey === cardToCancel.bakuganKey)

        if (ability) {

            const card = [...AbilityCardsList, ...ExclusiveAbilitiesList].find((card) => card.key === ability.key)
            const cardUser = Bakugans[cardToCancel.bakuganKey]

            const animation: AnimationDirectivesTypes = {
                type: 'CANCEL_ABILITY_CARD',
                data: {
                    card: ability.key,
                    attribut: cardUser.attribut
                },
                message: [{
                    text: `${card?.name || 'Ability Card'} of ${cardUser.name} as been nullified !`,
                    turn: roomState?.turnState.turnCount
                }],
                resolve: false
            }

            roomState.animations.push(animation)
            roomState.animationsForReplay.push(animation)

            if (card?.onCanceled) card.onCanceled({
                bakuganKey: cardToCancel.bakuganKey,
                roomState: roomState,
                slot: cardToCancel.slot,
                userId: cardToCancel.userId
            })

            ability.canceled = true
        }

    }


    if (slotOfGate) {
        // const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)
        const abilities = slotOfGate.activateAbilities.filter((ability) => {
            return (
                !ability.canceled &&
                ability.userId !== userId
            );
        });

        abilities.forEach((lastAbility) => {
            CancelAbilityCardEffect({
                ability: lastAbility,
                roomState: roomState,
                slotOfGate: slotOfGate
            })
        })
    }

    return null
}