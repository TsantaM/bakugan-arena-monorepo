import { resolutionType } from "../../type/actions-serveur-requests.js";
import { stateType } from "../../type/room-types.js";
import { applyBakuganMove, type BakuganMoveCustomAnimation } from "./apply-bakugan-move.js";

type MoveCustomAnimation = BakuganMoveCustomAnimation

/** Déplace un bakugan choisi vers un slot choisi (Sling Blazer, Marionnette…). */
export function moveSelectedBakugan({
    resolution,
    roomState,
    requireUserOnSlot = false,
    customAnimations,
}: {
    resolution: resolutionType,
    roomState: stateType,
    requireUserOnSlot?: boolean,      // Sert pour Sling Blazer
    customAnimations?: MoveCustomAnimation[]
}) {
    if (!roomState) return;
    if (resolution.data.type !== "MOVE_BAKUGAN_TO_ANOTHER_SLOT") return;

    const { data } = resolution;

    const bakugan = roomState.protalSlots
        .flatMap(slot => slot.bakugans)
        .find(b => b.key === data.bakugan.key && b.userId === data.bakugan.userId);

    if (!bakugan) return;

    const initialSlot = roomState.protalSlots.find(s => s.id === bakugan.slot_id);
    const slotTarget = roomState.protalSlots.find(s => s.id === data.slot);

    if (!initialSlot || !slotTarget) return;

    // Cas Sling Blazer : vérifier que le lanceur est présent sur le slot
    if (requireUserOnSlot) {
        const userPresent = initialSlot.bakugans.some(
            b => b.userId === resolution.userId
        );
        if (!userPresent) return;   // Sécurité
    }

    applyBakuganMove({
        roomState,
        bakugan,
        fromSlot: initialSlot,
        toSlot: slotTarget,
        customAnimations,
    })
}
