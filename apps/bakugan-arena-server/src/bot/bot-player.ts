import { io, Socket } from "socket.io-client"
import {
  AbilityCardsActionsRequestsType,
  ActivePlayerActionRequestType,
  gateCardActionRequestsType,
  InactivePlayerActionRequestType,
  logGameEvent,
  logDiagnostic,
  resolutionType,
  stateType,
} from "@bakugan-arena/game-data"
import { BOT_ACCOUNTS, BotAccount } from "../functions/bot-data"
import { Battle_Brawlers_Game_State } from "../game-state/battle-brawlers-game-state"
import {
  clearMatchMemory,
  evaluateLegalMovesDetailed,
  pickMoveSoftmax,
} from "./ai"
import type { SimulateAction } from "./ai"

const ACTION_DELAY_MS = 450
const STALL_WATCHDOG_INTERVAL_MS = 2_000
const STALL_THRESHOLD_MS = 4_000
const ADDITIONAL_STUCK_TIMEOUT_MS = 30_000
const CHECK_ACTIVITIES_INTERVAL_MS = 8_000

type TurnActionRequest = ActivePlayerActionRequestType | InactivePlayerActionRequestType

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const getRoomState = (roomId: string): stateType | undefined =>
  Battle_Brawlers_Game_State.find((room) => room?.roomId === roomId)

const countTurnActions = (
  request: ActivePlayerActionRequestType | InactivePlayerActionRequestType,
): number =>
  request.actions.mustDo.length +
  request.actions.mustDoOne.length +
  request.actions.optional.length

/** Même logique que le gameboard : ignorer les requests destinées à l'autre rôle. */
const isTurnRequestForBot = (
  state: stateType,
  botUserId: string,
  request: TurnActionRequest,
): boolean => {
  const isBotActive = state.turnState.turn === botUserId
  if (request.target === "ACTIVE_PLAYER") return isBotActive
  if (request.target === "INACTIVE_PLAYER") return !isBotActive
  return isBotActive
}

const isBotTargetOfPendingAdditional = (
  state: stateType,
  botUserId: string,
): boolean => {
  const ability = state.AbilityAditionalRequest[0]
  if (ability) {
    const target = ability.data.target ?? ability.userId
    return target === botUserId
  }

  const gate = state.gateCardActionRequest[0]
  if (gate && gate.data.type !== "TURN_ACTION_LAUNCHER") {
    const target = gate.data.target ?? gate.userId
    return target === botUserId
  }

  return false
}

const resolveTurnRequestFromState = (
  state: stateType,
  botUserId: string,
): TurnActionRequest | undefined => {
  if (state.turnState.turn === botUserId) {
    return state.ActivePlayerActionRequest
  }
  if (state.turnState.previous_turn === botUserId) {
    return state.InactivePlayerActionRequest
  }
  return undefined
}

const shouldBotActFromState = (
  state: stateType,
  botUserId: string,
  pendingAdditionalRequests: number,
): boolean => {
  if (state.status.finished || pendingAdditionalRequests > 0) return false

  if (isBotTargetOfPendingAdditional(state, botUserId)) {
    return true
  }

  const request = resolveTurnRequestFromState(state, botUserId)
  if (!request) return false

  return countTurnActions(request) > 0
}

/**
 * Émet le coup choisi par l'IA (SimulateAction → events socket serveur).
 */
const emitSimulateAction = (
  socket: Socket,
  roomId: string,
  action: SimulateAction
): boolean => {
  switch (action.type) {
    case "SET_GATE":
      socket.emit("set-gate", {
        roomId,
        gateId: action.gateId,
        slot: action.slot ?? null,
        userId: action.userId,
      })
      return true

    case "SET_BAKUGAN":
      socket.emit("set-bakugan", {
        roomId,
        bakuganKey: action.bakuganKey,
        slot: action.slot,
        userId: action.userId,
      })
      return true

    case "USE_ABILITY":
      socket.emit("use-ability-card", {
        roomId,
        abilityId: action.abilityId,
        slot: action.slot,
        userId: action.userId,
        bakuganKey: action.bakuganKey,
      })
      return true

    case "ACTIVE_GATE":
      socket.emit("active-gate-card", {
        roomId,
        gateId: action.gateId,
        slot: action.slot,
        userId: action.userId,
      })
      return true

    case "CHANGE_ATTRIBUTE":
      socket.emit("change-attribut", {
        roomId,
        attribut: action.attribut,
        bakugan: action.bakugan,
        userId: action.userId,
      })
      return true

    case "TURN_SKIP":
      socket.emit("turn-action", { roomId, userId: action.userId })
      return true

    case "ABILITY_ADDITIONAL": {
      const pending = getRoomState(roomId)?.AbilityAditionalRequest[0]
      if (!pending) return false
      const resolution: resolutionType = {
        roomId: pending.roomId,
        userId: pending.userId,
        cardKey: pending.cardKey,
        bakuganKey: pending.bakuganKey,
        slot: pending.slot,
        data: action.data,
      }
      socket.emit("ability-additional-request", resolution)
      return true
    }

    case "GATE_ADDITIONAL": {
      const pending = getRoomState(roomId)?.gateCardActionRequest[0]
      if (!pending) return false
      socket.emit("gate-card-additional-request", {
        roomId: pending.roomId,
        userId: pending.userId,
        cardKey: pending.cardKey,
        slot: pending.slot,
        data: action.data,
      })
      return true
    }

    default:
      return false
  }
}

const playBestMove = (
  socket: Socket,
  roomId: string,
  userId: string,
  botLabel: string,
  request?: TurnActionRequest
): boolean => {
  const state = getRoomState(roomId)
  if (!state) {
    console.warn(`[BOT ${botLabel}] no room state for`, roomId)
    return false
  }

  const { moves, adaptation } = evaluateLegalMovesDetailed({ state, userId, request })
  const temperature = adaptation?.temperature ?? 0.4

  // Tour 0 : scorer les gates (softmax un peu plus exploratoire via temperature)
  if (state.turnState.turnCount === 0) {
    const gateMoves = moves.filter((m) => m.action.type === "SET_GATE")
    if (gateMoves.length > 0) {
      const pick = pickMoveSoftmax(gateMoves, Math.max(temperature, 0.45))
      if (pick) {
        logGameEvent(state, {
          handler: "bot-play",
          category: "bot",
          input: { botLabel, phase: "turn0-gate" },
          output: {
            label: pick.label,
            score: pick.score,
            options: gateMoves.length,
            adaptation: adaptation?.reason,
          },
          message: `[BOT ${botLabel}] gate tour 0 : ${pick.label}`,
        })
        return emitSimulateAction(socket, roomId, pick.action)
      }
    }
  }

  const best = pickMoveSoftmax(moves, temperature)

  if (!best) {
    if (state.turnState.turn !== userId) {
      logDiagnostic(state, {
        handler: "bot.turn-skip-rejected",
        level: "warn",
        message: `[BOT ${botLabel}] skip refusé — bot non actif`,
        output: { botUserId: userId, activePlayerId: state.turnState.turn },
      })
      return false
    }
    logGameEvent(state, {
      handler: "bot-play",
      category: "bot",
      input: { botLabel, legalMoves: moves.length },
      output: { action: "TURN_SKIP", adaptation: adaptation?.reason },
      message: `[BOT ${botLabel}] aucun coup → skip`,
    })
    socket.emit("turn-action", { roomId, userId })
    return true
  }

  logGameEvent(state, {
    handler: "bot-play",
    category: "bot",
    input: { botLabel },
    output: {
      label: best.label,
      score: best.score,
      options: moves.length,
      pressure: adaptation?.pressure,
      adaptation: adaptation?.reason,
    },
    message: `[BOT ${botLabel}] joue ${best.label}`,
  })
  return emitSimulateAction(socket, roomId, best.action)
}

const createBotPlayer = (bot: BotAccount, serverUrl: string) => {
  let roomId: string | null = null
  let actionQueue: Promise<void> = Promise.resolve()
  let queueDepth = 0
  /** Empêche un turn-action de passer pendant qu'une additional request est en cours */
  let pendingAdditionalRequests = 0
  let additionalStartedAt: number | null = null
  let deferredTurnActionRequest: TurnActionRequest | null = null
  let lastBotActionAt = 0
  let lastCheckActivitiesAt = 0
  let stallWatchdogInterval: ReturnType<typeof setInterval> | null = null

  const markBotAction = () => {
    lastBotActionAt = Date.now()
  }

  const resyncRoomSocket = (targetRoomId: string) => {
    socket.emit("init-room-state", {
      roomId: targetRoomId,
      userId: bot.userId,
      parentSocket: socket.id,
      isSpectator: false,
    })
  }

  const stopStallWatchdog = () => {
    if (stallWatchdogInterval !== null) {
      clearInterval(stallWatchdogInterval)
      stallWatchdogInterval = null
    }
  }

  const startStallWatchdog = () => {
    stopStallWatchdog()
    stallWatchdogInterval = setInterval(() => {
      if (!roomId) return

      const currentRoomId = roomId
      const state = getRoomState(currentRoomId)
      if (!state || state.status.finished) return

      const now = Date.now()

      if (
        pendingAdditionalRequests > 0 &&
        additionalStartedAt !== null &&
        now - additionalStartedAt >= ADDITIONAL_STUCK_TIMEOUT_MS
      ) {
        logDiagnostic(state, {
          handler: "bot.additional-stuck-reset",
          level: "warn",
          message: `[BOT ${bot.userId}] compteur additional bloqué — reset`,
          output: {
            pendingAdditionalRequests,
            stuckMs: now - additionalStartedAt,
          },
        })
        pendingAdditionalRequests = 0
        additionalStartedAt = null
        deferredTurnActionRequest = null
      }

      if (
        now - lastCheckActivitiesAt >= CHECK_ACTIVITIES_INTERVAL_MS &&
        shouldBotActFromState(state, bot.userId, pendingAdditionalRequests)
      ) {
        lastCheckActivitiesAt = now
        socket.emit("check-activities", {
          roomId: currentRoomId,
          userId: bot.userId,
        })
      }

      if (queueDepth > 0 || pendingAdditionalRequests > 0) return
      if (!shouldBotActFromState(state, bot.userId, 0)) return
      if (now - lastBotActionAt < STALL_THRESHOLD_MS) return

      const request = resolveTurnRequestFromState(state, bot.userId)
      logDiagnostic(state, {
        handler: "bot.stall-recovery",
        level: "warn",
        message: `[BOT ${bot.userId}] reprise depuis l'état serveur (watchdog)`,
        output: {
          turnCount: state.turnState.turnCount,
          activePlayerId: state.turnState.turn,
          requestTarget: request?.target,
          idleMs: now - lastBotActionAt,
        },
      })

      enqueuePlayFromState(currentRoomId, request, "watchdog")
    }, STALL_WATCHDOG_INTERVAL_MS)
  }

  const enqueue = (task: () => void | Promise<void>) => {
    queueDepth++
    actionQueue = actionQueue
      .then(async () => {
        await delay(ACTION_DELAY_MS)
        await task()
      })
      .catch((error) => {
        console.error(`[BOT ${bot.userId}] action error:`, error)
      })
      .finally(() => {
        queueDepth = Math.max(0, queueDepth - 1)
      })
  }

  const enqueuePlayFromState = (
    currentRoomId: string,
    request?: TurnActionRequest,
    source = "state-resync",
  ) => {
    enqueue(() => {
      const state = getRoomState(currentRoomId)
      if (!state || state.status.finished) return

      const resolvedRequest =
        request ?? resolveTurnRequestFromState(state, bot.userId)

      if (
        resolvedRequest &&
        !isTurnRequestForBot(state, bot.userId, resolvedRequest)
      ) {
        return
      }

      const played = playBestMove(
        socket,
        currentRoomId,
        bot.userId,
        bot.userId,
        resolvedRequest,
      )
      if (played) {
        markBotAction()
        return
      }

      logDiagnostic(state, {
        handler: "bot.play-failed",
        level: "warn",
        message: `[BOT ${bot.userId}] playBestMove n'a rien émis (${source})`,
        output: {
          botUserId: bot.userId,
          requestTarget: resolvedRequest?.target,
          source,
        },
      })
    })
  }

  const replayDeferredTurnRequest = () => {
    if (pendingAdditionalRequests > 0 || !deferredTurnActionRequest || !roomId) {
      return
    }

    const request = deferredTurnActionRequest
    deferredTurnActionRequest = null
    const currentRoomId = roomId
    const state = getRoomState(currentRoomId)

    if (!state) return

    if (!isTurnRequestForBot(state, bot.userId, request)) {
      logDiagnostic(state, {
        handler: "bot.deferred-turn-request-stale",
        level: "warn",
        message: `[BOT ${bot.userId}] requête différée périmée — reprise depuis l'état`,
        output: {
          requestTarget: request.target,
          currentTurn: state.turnState.turn,
          botUserId: bot.userId,
        },
      })
      enqueuePlayFromState(currentRoomId, undefined, "deferred-stale")
      return
    }

    enqueuePlayFromState(currentRoomId, request, "deferred-replay")
  }

  const beginAdditionalHandling = () => {
    pendingAdditionalRequests++
    if (additionalStartedAt === null) {
      additionalStartedAt = Date.now()
    }
  }

  const endAdditionalHandling = () => {
    pendingAdditionalRequests = Math.max(0, pendingAdditionalRequests - 1)
    if (pendingAdditionalRequests === 0) {
      additionalStartedAt = null
    }
    replayDeferredTurnRequest()
  }

  const resetBotSession = (clearRoom: boolean) => {
    if (clearRoom && roomId) clearMatchMemory(roomId, bot.userId)
    if (clearRoom) roomId = null
    pendingAdditionalRequests = 0
    additionalStartedAt = null
    deferredTurnActionRequest = null
    lastBotActionAt = 0
    lastCheckActivitiesAt = 0
    stopStallWatchdog()
  }

  const socket: Socket = io(serverUrl, {
    auth: { userId: bot.userId },
    transports: ["websocket"],
    reconnection: true,
    reconnectionDelay: 2000,
  })

  socket.on("connect", () => {
    console.log(`[BOT ${bot.userId}] connected (${socket.id})`)
    if (roomId) {
      resyncRoomSocket(roomId)
      startStallWatchdog()
    }
  })

  socket.on("disconnect", (reason) => {
    console.log(`[BOT ${bot.userId}] disconnected:`, reason)
    stopStallWatchdog()
    pendingAdditionalRequests = 0
    additionalStartedAt = null
    deferredTurnActionRequest = null
  })

  const joinRoom = (matchedRoomId: string) => {
    if (roomId) clearMatchMemory(roomId, bot.userId)
    roomId = matchedRoomId
    pendingAdditionalRequests = 0
    additionalStartedAt = null
    deferredTurnActionRequest = null
    lastBotActionAt = Date.now()
    lastCheckActivitiesAt = 0
    clearMatchMemory(matchedRoomId, bot.userId)
    resyncRoomSocket(matchedRoomId)
    startStallWatchdog()
  }

  socket.on("match-found", (matchedRoomId: string) => {
    console.log(`[BOT ${bot.userId}] match found:`, matchedRoomId)
    joinRoom(matchedRoomId)
  })

  socket.on("game-finished", () => {
    console.log(`[BOT ${bot.userId}] game finished`)
    resetBotSession(true)
  })

  socket.on("turn-action-request", (request: TurnActionRequest) => {
    if (!roomId) return
    const currentRoomId = roomId
    enqueue(() => {
      const state = getRoomState(currentRoomId)
      if (!state) return

      if (!isTurnRequestForBot(state, bot.userId, request)) {
        return
      }

      if (pendingAdditionalRequests > 0) {
        deferredTurnActionRequest = request
        logDiagnostic(state, {
          handler: "bot.skip-turn-request",
          level: "warn",
          message: `[BOT ${bot.userId}] turn-action-request ignorée — additional en cours`,
          output: { pendingAdditionalRequests, botUserId: bot.userId },
        })
        return
      }

      const played = playBestMove(
        socket,
        currentRoomId,
        bot.userId,
        bot.userId,
        request,
      )
      if (played) {
        markBotAction()
        return
      }

      logDiagnostic(state, {
        handler: "bot.play-failed",
        level: "warn",
        message: `[BOT ${bot.userId}] playBestMove n'a rien émis`,
        output: { botUserId: bot.userId, requestTarget: request.target },
      })
    })
  })

  socket.on("gate-card-additional-request", (request: gateCardActionRequestsType) => {
    if (!roomId) return
    if (request.data.type === "TURN_ACTION_LAUNCHER") return

    const targetsBot =
      (!request.data.target && request.userId === bot.userId) ||
      request.data.target === bot.userId
    if (!targetsBot) return

    beginAdditionalHandling()
    enqueue(() => {
      try {
        const ok = playBestMove(socket, roomId!, bot.userId, bot.userId)
        if (ok) {
          markBotAction()
        } else {
          console.warn(`[BOT ${bot.userId}] gate additional fallback SKIP`)
          socket.emit("gate-card-additional-request", {
            roomId: request.roomId,
            userId: request.userId,
            cardKey: request.cardKey,
            slot: request.slot,
            data: { type: "SKIP_ACTION" },
          })
          markBotAction()
        }
      } finally {
        endAdditionalHandling()
      }
    })
  })

  socket.on("ability-additional-request", (request: AbilityCardsActionsRequestsType) => {
    if (!roomId) return

    const targetsBot =
      (!request.data.target && request.userId === bot.userId) ||
      request.data.target === bot.userId
    if (!targetsBot) return

    beginAdditionalHandling()
    enqueue(() => {
      try {
        const ok = playBestMove(socket, roomId!, bot.userId, bot.userId)
        if (ok) {
          markBotAction()
        } else {
          console.warn(`[BOT ${bot.userId}] ability additional fallback SKIP`)
          socket.emit("ability-additional-request", {
            roomId: request.roomId,
            userId: request.userId,
            cardKey: request.cardKey,
            bakuganKey: request.bakuganKey,
            slot: request.slot,
            data: { type: "SKIP_ACTION" },
          } satisfies resolutionType)
          markBotAction()
        }
      } finally {
        endAdditionalHandling()
      }
    })
  })

  return socket
}

export const startBotPlayers = (port: number) => {
  const serverUrl = process.env.BOT_SERVER_URL ?? `http://127.0.0.1:${port}`

  for (const bot of BOT_ACCOUNTS) {
    createBotPlayer(bot, serverUrl)
  }

  console.log(`[BOT] Started ${BOT_ACCOUNTS.length} bot player(s) → ${serverUrl}`)
}
