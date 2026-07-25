import { Bakugans } from "../../battle-brawlers/bakugans.js";
import { GateCardsList } from "../../battle-brawlers/gate-gards.js";
import { resolutionType } from "../../type/actions-serveur-requests.js";
import { Message } from "../../type/animations-directives.js";
import { bakuganOnSlot, slots_id, stateType } from "../../type/room-types.js";
import { OpenGateCardActionRequest } from "../action-request-functions/open-gate-card-action-request.js";
import { CheckBattleStillInProcess } from "../check-battle-still-in-process.js";
import { AddRenfortAnimationDirective } from "../create-animation-directives/add-renfort-directive.js";
import { CustomAnimationDirective } from "../create-animation-directives/custom-animation.js";
import { MoveToAnotherSlotDirectiveAnimation } from "../create-animation-directives/move-to-another-slot.js";
import RemoveRenfortAnimationDirective from "../create-animation-directives/remove-renfort-animation-directive.js";
import { NewAdditionnalMessage } from "../new-additional-message.js";
import { isProtectedAgainstAbility } from "./protection-status.js";

type MoveCustomAnimation = {
    animationKey: string
    sourceBakugan?: bakuganOnSlot
    targetBakugans?: bakuganOnSlot[]
    slotId?: slots_id
    payload?: Record<string, unknown>
    message?: Message[]
}

export function moveSelectedBakugan({
    resolution,
    roomState,
    requireUserOnSlot = false,
    customAnimations,
}: {
    resolution: resolutionType,
    roomState: stateType,
    requireUserOnSlot?: boolean       // Sert pour Sling Blazer
    customAnimations?: MoveCustomAnimation[]
}) {
    if (!roomState) return;
    if (resolution.data.type !== "MOVE_BAKUGAN_TO_ANOTHER_SLOT") return;

    const { data } = resolution;

    // Le bakugan à déplacer
    const bakugansOnField = roomState.protalSlots.flatMap(slot => slot.bakugans);

    const bakugan = bakugansOnField.find(
        b => b.key === data.bakugan.key && b.userId === data.bakugan.userId
    );

    if (!bakugan) return;
    if (isProtectedAgainstAbility(bakugan)) {
        NewAdditionnalMessage({
            roomState: roomState,
            key: 'bakugan_protected',
            params: { name: Bakugans[bakugan.key].name },
        })
        return
    }

    const initialSlot = roomState.protalSlots.find(s => s.id === bakugan.slot_id);
    if (!initialSlot) return;

    const index = initialSlot.bakugans.findIndex(
        b => b.key === bakugan.key && b.userId === bakugan.userId
    );
    if (index < 0) return;

    const slotTarget = roomState.protalSlots.find(s => s.id === data.slot);
    if (!slotTarget || slotTarget.portalCard === null) return;

    // Cas Sling Blazer : vérifier que le lanceur est présent sur le slot
    if (requireUserOnSlot) {
        const userPresent = initialSlot.bakugans.some(
            b => b.userId === resolution.userId
        );
        if (!userPresent) return;   // Sécurité
    }

    // Check Gate Card on Move Bakugan Function
    const gate = GateCardsList.find((card) => card.key === initialSlot.portalCard?.key)

    if (gate && gate.onRemoveBakugan) {
        gate.onRemoveBakugan({
            bakugan: bakugan,
            roomState: roomState,
            slot: initialSlot
        })
    }



    if (roomState.battleState.battleInProcess && !roomState.battleState.paused && roomState.battleState.slot === initialSlot.id) {
        const sameTeam = initialSlot.bakugans.filter((b) => b.key !== bakugan.key && b.userId === bakugan.userId).some(
            b => b.userId === bakugan.userId
        );

        if (sameTeam) {
            RemoveRenfortAnimationDirective({
                animations: roomState.animations,
                bakugan: structuredClone(bakugan),
                turnCount: roomState.turnState.turnCount,
                    roomState: roomState

            })
        }
    }


    // Déplacement
    const lastId = slotTarget && slotTarget?.bakugans.length > 0 ? slotTarget.bakugans[slotTarget.bakugans.length - 1].id : 0
    const newId = lastId + 1
    const newBakuganState: bakuganOnSlot = {
        ...bakugan,
        slot_id: data.slot,
        id: newId
    };

    slotTarget.bakugans.push(newBakuganState);
    initialSlot.bakugans.splice(index, 1);

    // Animation
    if (customAnimations && customAnimations.length > 0) {
        customAnimations.forEach((animation) => {
            CustomAnimationDirective({
                roomState,
                animationKey: animation.animationKey,
                sourceBakugan: animation.sourceBakugan,
                targetBakugans: animation.targetBakugans ?? [structuredClone(bakugan)],
                slotId: animation.slotId ?? data.slot,
                payload: animation.payload ?? {
                    bakugan: structuredClone(bakugan),
                    initialSlot: structuredClone(initialSlot),
                    newSlot: structuredClone(slotTarget),
                },
                message: animation.message,
            })
        })
    } else {
        MoveToAnotherSlotDirectiveAnimation({
            animations: roomState.animations,
            bakugan: structuredClone(bakugan),
            initialSlot: structuredClone(initialSlot),
            newSlot: structuredClone(slotTarget),
            turn: roomState.turnState.turnCount,
                        roomState: roomState

        });
    }

    // --- Gate Card Effect on Set bakugan
    const landingGate = GateCardsList.find((card) => card.key === slotTarget.portalCard?.key)
    if (landingGate && landingGate.onSetBakuganOnSlot) {
        landingGate.onSetBakuganOnSlot({
            bakugan: bakugan,
            roomState: roomState,
            slot: initialSlot
        })
    }

    // Check combats
    CheckBattleStillInProcess(roomState);

    // --- Gestion du renfort ---
    if (
        roomState.battleState.battleInProcess &&
        roomState.battleState.slot === slotTarget.id
    ) {
        const sameTeam = slotTarget.bakugans.some(
            b => b.userId === bakugan.userId
        );

        if (sameTeam) {
            AddRenfortAnimationDirective({
                animations: roomState.animations,
                roomState: roomState,
                bakugan: bakugan,
                slot: slotTarget,
                turn: roomState.turnState.turnCount

            });
        }
    }

    OpenGateCardActionRequest({ roomState });

}
