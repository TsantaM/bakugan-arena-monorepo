import { GateCardsList } from "../../battle-brawlers/gate-gards.js";
import { resolutionType } from "../../type/actions-serveur-requests.js";
import { bakuganOnSlot, stateType } from "../../type/room-types.js";
import { OpenGateCardActionRequest } from "../action-request-functions/open-gate-card-action-request.js";
import { CheckBattle } from "../check-battle-in-process.js";
import { CheckBattleStillInProcess } from "../check-battle-still-in-process.js";
import { AddRenfortAnimationDirective } from "../create-animation-directives/add-renfort-directive.js";
import { MoveToAnotherSlotDirectiveAnimation } from "../create-animation-directives/move-to-another-slot.js";

export function dragBakuganToUserSlot({
    resolution,
    roomState  // Certaines cartes (ex: AntiMuse) ne veulent PAS les renforts
}: {
    resolution: resolutionType,
    roomState: stateType
}) {
    if (!roomState) return;
    if (resolution.data.type !== "SELECT_BAKUGAN_ON_DOMAIN") return;

    const targetSlotId = resolution.data.slot;
    const targetBakuganKey = resolution.data.bakugan;

    const slotTarget = roomState.protalSlots.find(s => s.id === targetSlotId);
    const slotOfGate = roomState.protalSlots.find(s => s.id === resolution.slot);

    if (!slotOfGate || !slotTarget || !targetBakuganKey) return;

    const targetIndex = slotTarget.bakugans.findIndex(b => b.key === targetBakuganKey);
    const bakuganToDrag = slotTarget.bakugans.find(b => b.key === targetBakuganKey);

    if (!bakuganToDrag) return;

    // Vérifier que la carte utilisateur contient bien le bakugan lanceur
    const user = slotOfGate.bakugans.find(
        b => b.key === resolution.bakuganKey && b.userId === resolution.userId
    );
    if (!user) return;

    // Check Gate Card on Move Bakugan Function
    const gate = GateCardsList.find((card) => card.key === slotTarget.portalCard?.key)

    if (gate && gate.onRemoveBakugan) {
        gate.onRemoveBakugan({
            bakugan: bakuganToDrag,
            roomState: roomState,
            slot: slotTarget
        })
    }


    // --- Déplacement du bakugan ---
    const newState: bakuganOnSlot = {
        ...bakuganToDrag,
        slot_id: slotOfGate.id,
    };

    slotOfGate.bakugans.push(newState);
    slotTarget.bakugans.splice(targetIndex, 1);

    // --- Animation ---
    MoveToAnotherSlotDirectiveAnimation({
        animations: roomState.animations,
        bakugan: structuredClone(bakuganToDrag),
        initialSlot: structuredClone(slotTarget),
        newSlot: structuredClone(slotOfGate),
        turn: roomState.turnState.turnCount
    });

    // --- Gate Card Effect on Set bakugan
    const landingGate = GateCardsList.find((card) => card.key === slotOfGate.portalCard?.key)
    if (landingGate && landingGate.onSetBakuganOnSlot) {
        landingGate.onSetBakuganOnSlot({
            bakugan: bakuganToDrag,
            roomState: roomState,
            slot: slotOfGate
        })
    }


    // --- Combat + Gate ---
    CheckBattleStillInProcess(roomState);
    CheckBattle({ roomState });

    // --- Gestion du renfort ---
    if (
        roomState.battleState.battleInProcess &&
        roomState.battleState.slot === slotOfGate.id
    ) {
        const sameTeam = slotOfGate.bakugans.some(
            b => b.userId === bakuganToDrag.userId
        );

        if (sameTeam) {
            AddRenfortAnimationDirective({
                animations: roomState.animations,
                bakugan: bakuganToDrag,
                slot: slotOfGate,
                turn: roomState.turnState.turnCount

            });
        }
    }

    OpenGateCardActionRequest({ roomState });

    return { turnActionLaucher: true };
}