import { resolutionType } from "../../type/actions-serveur-requests.js";
import { bakuganOnSlot, stateType } from "../../type/room-types.js";
import { OpenGateCardActionRequest } from "../action-request-functions/open-gate-card-action-request.js";
import { CheckBattleStillInProcess } from "../check-battle-still-in-process.js";
import { AddRenfortAnimationDirective } from "../create-animation-directives/add-renfort-directive.js";
import { MoveToAnotherSlotDirectiveAnimation } from "../create-animation-directives/move-to-another-slot.js";

export function moveSelectedBakugan({
    resolution,
    roomState,
    requireUserOnSlot = false
}: {
    resolution: resolutionType,
    roomState: stateType,
    requireUserOnSlot?: boolean       // Sert pour Sling Blazer
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

    // Déplacement
    const newBakuganState: bakuganOnSlot = {
        ...bakugan,
        slot_id: data.slot
    };

    slotTarget.bakugans.push(newBakuganState);
    initialSlot.bakugans.splice(index, 1);

    // Animation
    MoveToAnotherSlotDirectiveAnimation({
        animations: roomState.animations,
        bakugan,
        initialSlot: structuredClone(initialSlot),
        newSlot: structuredClone(slotTarget)
    });

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
                bakugan: bakugan,
                slot: slotTarget,
            });
        }
    }

    OpenGateCardActionRequest({ roomState });

}