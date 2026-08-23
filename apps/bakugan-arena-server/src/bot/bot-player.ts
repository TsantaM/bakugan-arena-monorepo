import { io, Socket } from "socket.io-client"
import {
  AbilityCardsActionsRequestsType,
  ActivePlayerActionRequestType,
  canSkipTurn,
  gateCardActionRequestsType,
  InactivePlayerActionRequestType,
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
import { isAdditionalRequestForUser } from "./ai/expand-legal-moves"
import type { SimulateAction } from "./ai"

const ACTION_DELAY_MIN_MS = 5_000
const ACTION_DELAY_MAX_MS = 10_000
const BOT_WATCHDOG_MS = 15_000
const ADDITIONAL_STALE_MS = 15_000

type TurnActionRequest = ActivePlayerActionRequestType | InactivePlayerActionRequestType

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const randomActionDelayMs = () =>
  ACTION_DELAY_MIN_MS +
  Math.floor(Math.random() * (ACTION_DELAY_MAX_MS - ACTION_DELAY_MIN_MS + 1))

const getRoomState = (roomId: string): stateType | undefined =>
  Battle_Brawlers_Game_State.find((room) => room?.roomId === roomId)

/** Request de tour courante lue depuis l'état serveur (jamais une request socket périmée). */
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

/** Le bot peut encore agir (joueur actif ou inactif du tour courant). */
const isBotEligibleToPlay = (state: stateType, botUserId: string): boolean =>
  state.turnState.turn === botUserId || state.turnState.previous_turn === botUserId

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
      socket.emit("turn-action", {
        roomId,
        userId: action.userId,
        turnCount: getRoomState(roomId)?.turnState.turnCount,
      })
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
  request?: TurnActionRequest
): boolean => {
  const state = getRoomState(roomId)
  if (!state) {
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
        return emitSimulateAction(socket, roomId, pick.action)
      }
    }
  }

  const best = pickMoveSoftmax(moves, temperature)

  if (!best) {
    if (canSkipTurn(state, userId)) {
      socket.emit("turn-action", { roomId, userId, turnCount: state.turnState.turnCount })
      return true
    }
    socket.emit("check-activities", { roomId, userId })
    return false
  }

  return emitSimulateAction(socket, roomId, best.action)
}

const createBotPlayer = (bot: BotAccount, serverUrl: string) => {
  let roomId: string | null = null
  let actionQueue: Promise<void> = Promise.resolve()
  let pendingAdditionalRequests = 0
  let watchdogTimer: ReturnType<typeof setTimeout> | null = null
  let additionalStaleTimer: ReturnType<typeof setTimeout> | null = null

  const clearWatchdog = () => {
    if (watchdogTimer) clearTimeout(watchdogTimer)
    watchdogTimer = null
  }

  const enqueuePlayFromLiveState = (currentRoomId: string) => {
    enqueue(() => {
      if (pendingAdditionalRequests > 0) return

      socket.emit("check-activities", { roomId: currentRoomId, userId: bot.userId })

      const state = getRoomState(currentRoomId)
      if (!state || state.status.finished) return
      if (!isBotEligibleToPlay(state, bot.userId)) return

      const request = resolveTurnRequestFromState(state, bot.userId)
      playBestMove(socket, currentRoomId, bot.userId, request)
    })
  }

  const scheduleWatchdog = () => {
    clearWatchdog()
    watchdogTimer = setTimeout(() => {
      if (!roomId) return
      if (pendingAdditionalRequests > 0) return
      const state = getRoomState(roomId)
      if (!state || state.status.finished) return

      enqueuePlayFromLiveState(roomId)
    }, BOT_WATCHDOG_MS)
  }

  const resetAdditionalStaleGuard = () => {
    if (additionalStaleTimer) clearTimeout(additionalStaleTimer)
    if (pendingAdditionalRequests <= 0) return

    additionalStaleTimer = setTimeout(() => {
      if (pendingAdditionalRequests > 0) {
        pendingAdditionalRequests = 0
        if (roomId) {
          socket.emit("check-activities", { roomId, userId: bot.userId })
        }
      }
    }, ADDITIONAL_STALE_MS)
  }

  const enqueue = (task: () => void | Promise<void>) => {
    actionQueue = actionQueue
      .then(async () => {
        await delay(randomActionDelayMs())
        await task()
      })
      .catch((error) => {
        console.error(`[BOT ${bot.userId}] action error:`, error)
      })
  }

  const socket: Socket = io(serverUrl, {
    auth: { userId: bot.userId },
    transports: ["websocket"],
    reconnection: true,
    reconnectionDelay: 2000,
  })

  socket.on("disconnect", () => {
    clearWatchdog()
    if (additionalStaleTimer) clearTimeout(additionalStaleTimer)
    if (roomId) clearMatchMemory(roomId, bot.userId)
    roomId = null
    pendingAdditionalRequests = 0
  })

  const joinRoom = (matchedRoomId: string) => {
    if (roomId) clearMatchMemory(roomId, bot.userId)
    roomId = matchedRoomId
    pendingAdditionalRequests = 0
    clearMatchMemory(matchedRoomId, bot.userId)
    socket.emit("init-room-state", {
      roomId: matchedRoomId,
      userId: bot.userId,
      parentSocket: socket.id,
      isSpectator: false,
    })
  }

  socket.on("match-found", (matchedRoomId: string) => {
    joinRoom(matchedRoomId)
  })

  socket.on("game-finished", () => {
    clearWatchdog()
    if (roomId) clearMatchMemory(roomId, bot.userId)
    roomId = null
    pendingAdditionalRequests = 0
  })

  socket.on("bot-resync-request", ({ roomId: reqRoomId, userId }: { roomId: string; userId: string }) => {
    if (!roomId || roomId !== reqRoomId || userId !== bot.userId) return
    enqueuePlayFromLiveState(reqRoomId)
  })

  socket.on("turn-action-request", () => {
    if (!roomId) return
    scheduleWatchdog()
    enqueuePlayFromLiveState(roomId)
  })

  socket.on("gate-card-additional-request", (request: gateCardActionRequestsType) => {
    if (!roomId) return
    if (request.data.type === "TURN_ACTION_LAUNCHER") return

    const targetsBot =
      (!request.data.target && request.userId === bot.userId) ||
      request.data.target === bot.userId
    if (!targetsBot) return

    pendingAdditionalRequests++
    resetAdditionalStaleGuard()
    enqueue(() => {
      try {
        const state = getRoomState(roomId!)
        if (!state || state.status.finished) return

        const pending = state.gateCardActionRequest[0]
        if (
          !pending ||
          !isAdditionalRequestForUser(pending, bot.userId) ||
          pending.data.type === "TURN_ACTION_LAUNCHER"
        ) {
          return
        }

        const ok = playBestMove(socket, roomId!, bot.userId)
        if (!ok) {
          socket.emit("gate-card-additional-request", {
            roomId: pending.roomId,
            userId: pending.userId,
            cardKey: pending.cardKey,
            slot: pending.slot,
            data: { type: "SKIP_ACTION" },
          })
        }
      } finally {
        pendingAdditionalRequests = Math.max(0, pendingAdditionalRequests - 1)
      }
    })
  })

  socket.on("ability-additional-request", (request: AbilityCardsActionsRequestsType) => {
    if (!roomId) return

    const targetsBot =
      (!request.data.target && request.userId === bot.userId) ||
      request.data.target === bot.userId
    if (!targetsBot) return

    pendingAdditionalRequests++
    resetAdditionalStaleGuard()
    enqueue(() => {
      try {
        const state = getRoomState(roomId!)
        if (!state || state.status.finished) return

        const pending = state.AbilityAditionalRequest[0]
        if (!pending || !isAdditionalRequestForUser(pending, bot.userId)) {
          return
        }

        const ok = playBestMove(socket, roomId!, bot.userId)
        if (!ok) {
          socket.emit("ability-additional-request", {
            roomId: pending.roomId,
            userId: pending.userId,
            cardKey: pending.cardKey,
            bakuganKey: pending.bakuganKey,
            slot: pending.slot,
            data: { type: "SKIP_ACTION" },
          } satisfies resolutionType)
        }
      } finally {
        pendingAdditionalRequests = Math.max(0, pendingAdditionalRequests - 1)
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
}
