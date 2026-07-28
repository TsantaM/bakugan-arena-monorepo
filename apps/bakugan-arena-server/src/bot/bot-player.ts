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

type TurnActionRequest = ActivePlayerActionRequestType | InactivePlayerActionRequestType

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const getRoomState = (roomId: string): stateType | undefined =>
  Battle_Brawlers_Game_State.find((room) => room?.roomId === roomId)

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
  /** Empêche un turn-action de passer pendant qu'une additional request est en cours */
  let pendingAdditionalRequests = 0
  let deferredTurnActionRequest: TurnActionRequest | null = null

  const replayDeferredTurnRequest = () => {
    if (pendingAdditionalRequests > 0 || !deferredTurnActionRequest || !roomId) return
    const request = deferredTurnActionRequest
    deferredTurnActionRequest = null
    const currentRoomId = roomId
    enqueue(() => {
      playBestMove(socket, currentRoomId, bot.userId, bot.userId, request)
    })
  }

  const enqueue = (task: () => void | Promise<void>) => {
    actionQueue = actionQueue
      .then(async () => {
        await delay(ACTION_DELAY_MS)
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

  socket.on("connect", () => {
    console.log(`[BOT ${bot.userId}] connected (${socket.id})`)
  })

  socket.on("disconnect", (reason) => {
    console.log(`[BOT ${bot.userId}] disconnected:`, reason)
    if (roomId) clearMatchMemory(roomId, bot.userId)
    roomId = null
    pendingAdditionalRequests = 0
    deferredTurnActionRequest = null
  })

  const joinRoom = (matchedRoomId: string) => {
    if (roomId) clearMatchMemory(roomId, bot.userId)
    roomId = matchedRoomId
    pendingAdditionalRequests = 0
    deferredTurnActionRequest = null
    clearMatchMemory(matchedRoomId, bot.userId)
    // Un seul bootstrap : init-room-state suffit (évite un 2ᵉ turn-action-request)
    socket.emit("init-room-state", {
      roomId: matchedRoomId,
      userId: bot.userId,
      parentSocket: socket.id,
      isSpectator: false,
    })
  }

  socket.on("match-found", (matchedRoomId: string) => {
    console.log(`[BOT ${bot.userId}] match found:`, matchedRoomId)
    joinRoom(matchedRoomId)
  })

  socket.on("game-finished", () => {
    console.log(`[BOT ${bot.userId}] game finished`)
    if (roomId) clearMatchMemory(roomId, bot.userId)
    roomId = null
    pendingAdditionalRequests = 0
    deferredTurnActionRequest = null
  })

  socket.on("turn-action-request", (request: TurnActionRequest) => {
    if (!roomId) return
    const currentRoomId = roomId
    enqueue(() => {
      if (pendingAdditionalRequests > 0) {
        deferredTurnActionRequest = request
        const state = getRoomState(currentRoomId)
        if (state) {
          logDiagnostic(state, {
            handler: "bot.skip-turn-request",
            level: "warn",
            message: `[BOT ${bot.userId}] turn-action-request ignorée — additional en cours`,
            output: { pendingAdditionalRequests, botUserId: bot.userId },
          })
        }
        return
      }
      const played = playBestMove(socket, currentRoomId, bot.userId, bot.userId, request)
      if (!played) {
        const state = getRoomState(currentRoomId)
        if (state) {
          logDiagnostic(state, {
            handler: "bot.play-failed",
            level: "warn",
            message: `[BOT ${bot.userId}] playBestMove n'a rien émis`,
            output: { botUserId: bot.userId, requestTarget: request.target },
          })
        }
      }
    })
  })

  socket.on("gate-card-additional-request", (request: gateCardActionRequestsType) => {
    if (!roomId) return
    if (request.data.type === "TURN_ACTION_LAUNCHER") return

    const targetsBot =
      (!request.data.target && request.userId === bot.userId) ||
      request.data.target === bot.userId
    if (!targetsBot) return

    pendingAdditionalRequests++
    enqueue(() => {
      try {
        const ok = playBestMove(socket, roomId!, bot.userId, bot.userId)
        if (!ok) {
          console.warn(`[BOT ${bot.userId}] gate additional fallback SKIP`)
          socket.emit("gate-card-additional-request", {
            roomId: request.roomId,
            userId: request.userId,
            cardKey: request.cardKey,
            slot: request.slot,
            data: { type: "SKIP_ACTION" },
          })
        }
      } finally {
        pendingAdditionalRequests = Math.max(0, pendingAdditionalRequests - 1)
        replayDeferredTurnRequest()
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
    enqueue(() => {
      try {
        const ok = playBestMove(socket, roomId!, bot.userId, bot.userId)
        if (!ok) {
          console.warn(`[BOT ${bot.userId}] ability additional fallback SKIP`)
          socket.emit("ability-additional-request", {
            roomId: request.roomId,
            userId: request.userId,
            cardKey: request.cardKey,
            bakuganKey: request.bakuganKey,
            slot: request.slot,
            data: { type: "SKIP_ACTION" },
          } satisfies resolutionType)
        }
      } finally {
        pendingAdditionalRequests = Math.max(0, pendingAdditionalRequests - 1)
        replayDeferredTurnRequest()
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
