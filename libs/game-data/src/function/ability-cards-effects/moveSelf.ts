import { GateCardsList } from "../../battle-brawlers/gate-gards.js";
import { AbilityCardsActions, resolutionType } from "../../type/actions-serveur-requests.js";
import { Message } from "../../type/animations-directives.js";
import { activateAbilities, bakuganOnSlot, slots_id, stateType } from "../../type/room-types.js";
import { OpenGateCardActionRequest } from "../action-request-functions/index.js";
import { CheckBattleStillInProcess } from "../check-battle-still-in-process.js";
import { AbilityCardFailed, AddRenfortAnimationDirective, CustomAnimationDirective, MoveToAnotherSlotDirectiveAnimation } from "../create-animation-directives/index.js";
import RemoveRenfortAnimationDirective from "../create-animation-directives/remove-renfort-animation-directive.js";

type MoveSelfCustomAnimation = {
    animationKey: string
    sourceBakugan?: bakuganOnSlot
    targetBakugans?: bakuganOnSlot[]
    slotId?: slots_id
    payload?: Record<string, unknown>
    message?: Message[]
}

export function requestMoveSelfSlotSelection({
    roomState,
    userId,
    bakuganKey,
    slot,
    abilityKey,
    activationConditions,
}: {
    roomState: stateType
    userId: string
    bakuganKey: string
    slot: slots_id
    abilityKey: string
    activationConditions?: ({ roomState, userId }: { roomState: stateType, userId: string }) => boolean
}): AbilityCardsActions {
    const animation = AbilityCardFailed({ abilityKey })

    if (!roomState) return animation

    if (activationConditions) {
        const checker = activationConditions({ roomState, userId })
        if (checker === false) return animation
    }

    const opponentsUsableBakugans = roomState.decksState.find((deck) => deck.userId !== userId)?.bakugans.filter((deck) => !deck?.bakuganData.elimined && !deck?.bakuganData.onDomain)
    const opponentBakugansOnField = roomState.protalSlots.map((s) => s.bakugans).flat().filter((bakugan) => bakugan.slot_id !== slot && bakugan.userId !== userId)

    if ((opponentsUsableBakugans && opponentsUsableBakugans.length === 0 && opponentBakugansOnField.length === 0)) return animation

    const slotOfGate = roomState.protalSlots.find((s) => s.id === slot)
    const deck = roomState.decksState.find((d) => d.userId === userId)
    const userData = slotOfGate?.bakugans.find((bakugan) => bakugan.key === bakuganKey && bakugan.userId === userId)

    if (!slotOfGate && !deck && !userData) return animation

    const { battleInProcess, paused, slot: slotOfBattle } = roomState.battleState

    const slotsBeforeFilter: slots_id[] = opponentsUsableBakugans && opponentsUsableBakugans.length === 0 && opponentBakugansOnField.length > 0
        ? opponentBakugansOnField.map((bakugan) => bakugan.slot_id)
        : roomState.protalSlots.filter((s) => s.portalCard !== null && s.id !== slot).map((s) => s.id)

    const slots: slots_id[] = battleInProcess && paused
        ? slotsBeforeFilter.filter((s) => s !== slotOfBattle)
        : slotsBeforeFilter

    if (slots.length <= 0) return animation

    const request: AbilityCardsActions = {
        type: 'SELECT_SLOT',
        message: { key: 'prompt_select_slot', params: { abilityKey } },
        slots,
    }

    return request
}

export function moveBakuganToSelectedSlot({
    resolution,
    roomData,
    shouldBlockAlways = false,
    customAnimations,
}: {
    resolution: resolutionType,
    roomData: stateType,
    shouldBlockAlways?: boolean
    customAnimations?: MoveSelfCustomAnimation[]
}) {

    if (!roomData) return;
    if (resolution.data.type !== "SELECT_SLOT") return;

    const destination = resolution.data.slot;

    const slotOfGate = roomData.protalSlots.find((s) =>
        s.bakugans.some(
            (b) => b.key === resolution.bakuganKey && b.userId === resolution.userId
        )
    );
    const slotTarget = roomData.protalSlots.find((s) => s.id === destination);

    if (!slotOfGate || !slotTarget || !slotTarget.portalCard) return;

    const user = slotOfGate.bakugans.find(
        (b) => b.key === resolution.bakuganKey && b.userId === resolution.userId
    );
    if (!user) return;

    // Check Gate Card on Move Bakugan Function
    const gate = GateCardsList.find((card) => card.key === slotOfGate.portalCard?.key)

    if (gate && gate.onRemoveBakugan) {
        gate.onRemoveBakugan({
            bakugan: user,
            roomState: roomData,
            slot: slotOfGate
        })
    }


    const index = slotOfGate.bakugans.findIndex(
        (ba) => ba.key === user.key && ba.userId === user.userId
    );

    if (roomData.battleState.battleInProcess && !roomData.battleState.paused && roomData.battleState.slot === slotOfGate.id) {
        const sameTeam = slotOfGate.bakugans.filter((b) => b.key !== user.key && b.userId === user.userId).some(
            b => b.userId === user.userId
        );

        if (sameTeam) {
            RemoveRenfortAnimationDirective({
                animations: roomData.animations,
                bakugan: structuredClone(user),
                turnCount: roomData.turnState.turnCount,
                    roomState: roomData

            })
        }
    }


    // --- Move the bakugan ---
    const lastId = slotTarget && slotTarget?.bakugans.length > 0 ? slotTarget.bakugans[slotTarget.bakugans.length - 1].id : 0
    const newId = lastId + 1
    const newUserState: bakuganOnSlot = {
        ...user,
        slot_id: destination,
        id: newId
    };

    slotTarget.bakugans.push(newUserState);

    // --- Blocking logic ---
    if (shouldBlockAlways && slotTarget.portalCard.userId !== user.userId && !slotTarget.state.open) {
        slotTarget.state.blocked = {
            blocked: true,
            blockedWith: 'ABILITY',
            key: resolution.cardKey
        };
    }

    const ability = slotTarget.activateAbilities.findIndex((a) => a.key === resolution.cardKey && a.userId === resolution.userId && a.bakuganKey === resolution.bakuganKey)
    slotOfGate.bakugans.splice(index, 1);
    slotOfGate.activateAbilities.splice(ability, 1)

    const additional: Message = {
        key: 'gate_blocked',
        turn: roomData.turnState.turnCount,
        description: false
    }

    // --- Animations ---
    if (customAnimations && customAnimations.length > 0) {
        customAnimations.forEach((animation, animationIndex) => {
            const isLast = animationIndex === customAnimations.length - 1
            const messages = [
                ...(animation.message ?? []),
                ...(shouldBlockAlways && isLast ? [additional] : []),
            ]

            CustomAnimationDirective({
                roomState: roomData,
                animationKey: animation.animationKey,
                sourceBakugan: animation.sourceBakugan ?? structuredClone(user),
                targetBakugans: animation.targetBakugans,
                slotId: animation.slotId ?? destination,
                payload: animation.payload ?? {
                    bakugan: structuredClone(user),
                    initialSlot: structuredClone(slotOfGate),
                    newSlot: structuredClone(slotTarget),
                },
                message: messages.length > 0 ? messages : undefined,
            })
        })
    } else {
        MoveToAnotherSlotDirectiveAnimation({
            animations: roomData.animations,
            bakugan: structuredClone(user),
            initialSlot: structuredClone(slotOfGate),
            newSlot: structuredClone(slotTarget),
            turn: roomData.turnState.turnCount,
            additionalMessages: shouldBlockAlways ? [additional] : [],
            roomState: roomData
        });
    }

    // --- Gate Card Effect on Set bakugan
    const landingGate = GateCardsList.find((card) => card.key === slotTarget.portalCard?.key)
    if (landingGate && landingGate.onSetBakuganOnSlot) {
        landingGate.onSetBakuganOnSlot({
            bakugan: user,
            roomState: roomData,
            slot: slotTarget
        })
    }


    // --- Battles + Gate open ---
    CheckBattleStillInProcess(roomData);

    if (
        roomData.battleState.battleInProcess &&
        roomData.battleState.slot === slotTarget.id
    ) {
        const sameTeam = slotTarget.bakugans.some(
            b => b.userId === user.userId
        );

        if (sameTeam) {
            AddRenfortAnimationDirective({
                animations: roomData.animations,
                roomState: roomData,
                bakugan: user,
                slot: slotTarget,
                turn: roomData.turnState.turnCount
            });
        }
    }

    const newAbilityToPush: activateAbilities = {
        id: newId, // FR: Toujours supérieur au précédent / ENG: Always greater than the last one
        bakuganKey: resolution.bakuganKey,
        canceled: false,
        key: resolution.cardKey,
        userId: resolution.userId
    }

    
    slotTarget.activateAbilities.push(newAbilityToPush)

    OpenGateCardActionRequest({ roomState: roomData });

}


