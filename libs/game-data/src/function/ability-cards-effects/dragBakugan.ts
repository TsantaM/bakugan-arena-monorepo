import { resolutionType } from "../../type/actions-serveur-requests.js";
import { stateType } from "../../type/room-types.js";
import { applyBakuganMove, type BakuganMoveCustomAnimation } from "./apply-bakugan-move.js";
import { type EffectOrigin } from "./protection-status.js";

type DragCustomAnimation = BakuganMoveCustomAnimation

/**
 * Attire un bakugan adverse sur le slot du lanceur (Force d'Attraction,
 * Trappe de Sable, Dual Gazer…).
 *
 * Toutes les cibles/destinations sont revalidées ici : la liste construite par
 * `onActivate` n'est qu'une proposition, l'état a pu changer depuis et la
 * résolution vient du client.
 */
export function dragBakuganToUserSlot({
    resolution,
    roomState,
    trapped,
    origin = 'ABILITY',
    enableRenfort = true,
    customAnimations,
}: {
    resolution: resolutionType,
    roomState: stateType,
    trapped?: boolean,
    origin?: EffectOrigin
    enableRenfort?: boolean
    customAnimations?: DragCustomAnimation[]
}) {
    if (!roomState) return;
    if (resolution.data.type !== "SELECT_BAKUGAN_ON_DOMAIN") return;

    const targetSlotId = resolution.data.slot;
    const targetBakuganKey = resolution.data.bakugan;
    const targetUserId = resolution.data.userId

    const slotTarget = roomState.protalSlots.find(s => s.id === targetSlotId);
    const slotOfGate = roomState.protalSlots.find(s => s.id === resolution.slot);

    if (!slotOfGate || !slotTarget || !targetBakuganKey) return;

    const bakuganToDrag = slotTarget.bakugans.find(
        b => b.key === targetBakuganKey && b.userId === targetUserId
    );
    if (!bakuganToDrag) return;

    // Le slot d'arrivée doit bien porter le bakugan lanceur
    const user = slotOfGate.bakugans.find(
        b => b.key === resolution.bakuganKey && b.userId === resolution.userId
    );
    if (!user) return;

    const casterSnapshot = structuredClone(user)

    const outcome = applyBakuganMove({
        roomState,
        bakugan: bakuganToDrag,
        fromSlot: slotTarget,
        toSlot: slotOfGate,
        origin,
        trapWith: trapped ? { key: resolution.cardKey, origin } : undefined,
        enableRenfort,
        customAnimations: customAnimations?.map((animation) => ({
            ...animation,
            sourceBakugan: animation.sourceBakugan ?? casterSnapshot,
            slotId: animation.slotId ?? slotOfGate.id,
        })),
    })

    if (!outcome.moved) return;

    return { turnActionLaucher: true };
}
