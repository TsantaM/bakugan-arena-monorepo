import { resolutionType } from "../../type/actions-serveur-requests.js";
import { bakuganOnSlot, stateType } from "../../type/room-types.js";
import { OpenGateCardActionRequest } from "../action-request-functions/index.js";
import { CheckBattleStillInProcess } from "../check-battle-still-in-process.js";
import { AddRenfortAnimationDirective, MoveToAnotherSlotDirectiveAnimation } from "../create-animation-directives/index.js";

export function moveBakuganToSelectedSlot({
    resolution,
    roomData,
    shouldBlockAlways = false
}: {
    resolution: resolutionType,
    roomData: stateType,
    shouldBlockAlways?: boolean
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

    const index = slotOfGate.bakugans.findIndex(
        (ba) => ba.key === user.key && ba.userId === user.userId
    );

    // --- Move the bakugan ---
    const newUserState: bakuganOnSlot = {
        ...user,
        slot_id: destination
    };

    slotTarget.bakugans.push(newUserState);

    // --- Blocking logic ---
    if (shouldBlockAlways && slotTarget.portalCard.userId !== user.userId) {
        slotTarget.state.blocked = true;
    }

    slotOfGate.bakugans.splice(index, 1);

    // --- Animations ---
    MoveToAnotherSlotDirectiveAnimation({
        animations: roomData.animations,
        bakugan: user,
        initialSlot: structuredClone(slotOfGate),
        newSlot: structuredClone(slotTarget)
    });

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
                bakugan: user,
                slot: slotTarget,
            });
        }
    }

    OpenGateCardActionRequest({ roomState: roomData });

}


