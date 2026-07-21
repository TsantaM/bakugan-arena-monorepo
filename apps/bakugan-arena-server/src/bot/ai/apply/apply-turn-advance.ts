import {
  CheckBattleStillInProcess,
  CreateActionRequestFunction,
  GateCardsList,
  handleBattle,
  handleGateCards,
  updateTurnState,
  type stateType,
} from "@bakugan-arena/game-data"
import { ClearDomain } from "../../../functions/clear-domain"
import { getGameResult } from "../../../functions/CheckGameFinished"

/**
 * Pipeline de fin de tour sur une copie d'état
 * (équivalent logique de turnActionUpdater, sans sockets / timers / DB).
 */
export function applyTurnAdvance(state: stateType, userId: string): void {
  if (state.status.finished) return

  handleBattle(state, true)

  const opennable = handleGateCards(state)
  for (const card of opennable) {
    const slotOfGate = state.protalSlots.find((s) => s.id === card.slot)
    const gateCard = GateCardsList.find((g) => g.key === card.gateId)
    if (!slotOfGate || !gateCard || slotOfGate.state.open || slotOfGate.state.blocked) continue
    if (slotOfGate.portalCard?.key !== card.gateId) continue

    const bakuganKey = slotOfGate.bakugans.find((b) => b.userId === card.userId)?.key
    const openResult = gateCard.onOpen?.({
      roomState: state,
      slot: card.slot,
      bakuganKey: bakuganKey || undefined,
      userId: card.userId,
    })
    slotOfGate.state.open = true

    if (openResult && openResult.type !== "TURN_ACTION_LAUNCHER") {
      state.gateCardActionRequest.push({
        roomId: state.roomId,
        cardKey: gateCard.key,
        slot: card.slot,
        userId: card.userId,
        data: openResult,
      })
      // Comme en réel : on s'arrête si une request additionnelle est lancée
      return
    }
  }

  // Fin de bataille : le vrai onBattleEnd dépend de l'état global ;
  // en simu on se contente de marquer la fin de partie via getGameResult après ClearDomain.

  CheckBattleStillInProcess(state)
  ClearDomain(state, userId)
  updateTurnState(state)
  CreateActionRequestFunction({ roomState: state })

  const result = getGameResult(state)
  if (result.finished) {
    state.status.finished = true
    state.status.finisheAt = Date.now()
    state.status.winner = result.winner
  }

  state.animations = []
}
