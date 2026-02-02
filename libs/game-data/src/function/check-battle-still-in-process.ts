import { stateType } from "../type/type-index.js";

export function CheckBattleStillInProcess(roomState: stateType) {
    if (!roomState) return;

    const { battleState, protalSlots, turnState } = roomState;

    if (!battleState.battleInProcess) return;

    const battleSlot = protalSlots.find((slot) => slot.id === battleState.slot);
    if (!battleSlot) return;

    const bakugans = battleSlot.bakugans;

    // --- NEW LOGIC: verify that at least two DIFFERENT PLAYERS are still on the slot ---
    const distinctPlayers = new Set(bakugans.map((b) => b.userId)).size;

    const battleStillValid = bakugans.length >= 2 && distinctPlayers >= 2;

    if (battleStillValid) return; // Battle continues

    // --- Otherwise: END THE BATTLE ---
    battleState.battleInProcess = false;
    battleState.slot = null;
    battleState.turns = 2;
    battleState.paused = false;
    turnState.set_new_gate = true;
    turnState.set_new_bakugan = true;

    roomState.animations.push({
        type: "BATTLE-END",
        resolved: false
    });
}