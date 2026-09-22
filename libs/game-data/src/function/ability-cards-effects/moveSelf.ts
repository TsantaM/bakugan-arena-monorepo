import { AbilityCardsActions, resolutionType } from "../../type/actions-serveur-requests.js";
import { Message } from "../../type/animations-directives.js";
import { activateAbilities, slots_id, stateType } from "../../type/room-types.js";
import { AbilityCardFailed } from "../create-animation-directives/index.js";
import { applyBakuganMove, type BakuganMoveCustomAnimation } from "./apply-bakugan-move.js";
import { isValidMoveTarget, moveRefusalReason } from "./can-move-bakugan.js";

type MoveSelfCustomAnimation = BakuganMoveCustomAnimation

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

    if (!slotOfGate || !deck || !userData) return animation

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

    if (!slotOfGate || !slotTarget) return;

    const user = slotOfGate.bakugans.find(
        (b) => b.key === resolution.bakuganKey && b.userId === resolution.userId
    );
    if (!user) return;

    // Capturé avant le déplacement : le blocage dépend de l'état d'origine du slot
    const willBlock =
        shouldBlockAlways &&
        slotTarget.portalCard !== null &&
        slotTarget.portalCard.userId !== user.userId &&
        !slotTarget.state.open;

    // Pré-validation : on ne veut ni bloquer la gate ni déplacer la capacité
    // si le déplacement lui-même va être refusé.
    if (isValidMoveTarget(slotOfGate, slotTarget)) return;
    if (moveRefusalReason(user, 'ABILITY')) return;

    // --- Blocage de la gate d'arrivée (avant le déplacement : OpenGateCardActionRequest
    // est rejoué à la fin du move et doit voir la gate bloquée) ---
    if (willBlock) {
        slotTarget.state.blocked = {
            blocked: true,
            blockedWith: 'ABILITY',
            key: resolution.cardKey
        };
    }

    const abilityIndex = slotOfGate.activateAbilities.findIndex(
        (a) => a.key === resolution.cardKey && a.userId === resolution.userId && a.bakuganKey === resolution.bakuganKey
    );

    const additional: Message = {
        key: 'gate_blocked',
        turn: roomData.turnState.turnCount,
        description: false
    };

    const casterSnapshot = structuredClone(user);
    const blockMessages = shouldBlockAlways ? [additional] : [];

    const outcome = applyBakuganMove({
        roomState: roomData,
        bakugan: user,
        fromSlot: slotOfGate,
        toSlot: slotTarget,
        customAnimations: customAnimations?.map((animation, animationIndex) => {
            const isLast = animationIndex === customAnimations.length - 1;
            const messages = [
                ...(animation.message ?? []),
                ...(isLast ? blockMessages : []),
            ];

            return {
                ...animation,
                sourceBakugan: animation.sourceBakugan ?? casterSnapshot,
                slotId: animation.slotId ?? destination,
                message: messages.length > 0 ? messages : undefined,
            };
        }),
        additionalMessages: blockMessages,
    });

    if (!outcome.moved) return;

    // --- Transfert de la capacité active vers le slot d'arrivée ---
    if (abilityIndex >= 0) {
        slotOfGate.activateAbilities.splice(abilityIndex, 1);
    }

    const newAbilityToPush: activateAbilities = {
        id: outcome.bakugan.id, // FR: Toujours supérieur au précédent / ENG: Always greater than the last one
        bakuganKey: resolution.bakuganKey,
        canceled: false,
        key: resolution.cardKey,
        userId: resolution.userId
    };

    slotTarget.activateAbilities.push(newAbilityToPush);
}
