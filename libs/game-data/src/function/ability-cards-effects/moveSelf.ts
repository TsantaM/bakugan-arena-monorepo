import { GateCardsList } from "../../battle-brawlers/gate-gards.js";
import { resolutionType } from "../../type/actions-serveur-requests.js";
import { bakuganOnSlot, stateType } from "../../type/room-types.js";
import { OpenGateCardActionRequest } from "../action-request-functions/index.js";
import { CheckBattleStillInProcess } from "../check-battle-still-in-process.js";
import { AddRenfortAnimationDirective, MoveToAnotherSlotDirectiveAnimation } from "../create-animation-directives/index.js";
import RemoveRenfortAnimationDirective from "../create-animation-directives/remove-renfort-animation-directive.js";

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
                bakugan: structuredClone(user)
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
    if (shouldBlockAlways && slotTarget.portalCard.userId !== user.userId) {
        slotTarget.state.blocked = true;
    }

    slotOfGate.bakugans.splice(index, 1);

    // --- Animations ---
    MoveToAnotherSlotDirectiveAnimation({
        animations: roomData.animations,
        bakugan: structuredClone(user),
        initialSlot: structuredClone(slotOfGate),
        newSlot: structuredClone(slotTarget),
        turn: roomData.turnState.turnCount

    });

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
                bakugan: user,
                slot: slotTarget,
                turn: roomData.turnState.turnCount

            });
        }
    }

    OpenGateCardActionRequest({ roomState: roomData });

}


