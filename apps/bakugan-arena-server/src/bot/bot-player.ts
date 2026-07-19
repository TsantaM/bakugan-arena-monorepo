import { io, Socket } from "socket.io-client"
import {
  AbilityCardsActionsRequestsType,
  ActionType,
  ActivePlayerActionRequestType,
  gateCardActionRequestsType,
  InactivePlayerActionRequestType,
  resolutionDataType,
  resolutionGateCardDataType,
} from "@bakugan-arena/game-data"
import { BOT_ACCOUNTS, BotAccount } from "../functions/bot-data"

const ACTION_DELAY_MS = 400

type TurnActionRequest = ActivePlayerActionRequestType | InactivePlayerActionRequestType

const chooseFirst = <T>(items: T[] | undefined): T | undefined => {
  if (!items || items.length === 0) return undefined
  return items[0]
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const handleAction = (
  socket: Socket,
  roomId: string,
  userId: string,
  action: ActionType
): boolean => {
  switch (action.type) {
    case "SELECT_GATE_CARD": {
      const choice = chooseFirst(action.data)
      if (!choice) return false
      socket.emit("set-gate", { roomId, gateId: choice.key, slot: null, userId })
      return true
    }
    case "SET_GATE_CARD_ACTION": {
      const card = chooseFirst(action.data.cards)
      const slot = chooseFirst(action.data.slots)
      if (!card || !slot) return false
      socket.emit("set-gate", { roomId, gateId: card.key, slot, userId })
      return true
    }
    case "SET_BAKUGAN": {
      const bakugan = chooseFirst(action.data.bakugans)
      const slot = chooseFirst(action.data.setableSlots)
      if (!bakugan || !slot) return false
      socket.emit("set-bakugan", { roomId, bakuganKey: bakugan.key, slot, userId })
      return true
    }
    case "SELECT_BAKUGAN": {
      const choice = chooseFirst(action.data)
      if (!choice) return false
      socket.emit("set-bakugan", { roomId, bakuganKey: choice.key, slot: null, userId })
      return true
    }
    case "OPEN_GATE_CARD": {
      if (!action.gateId || !action.slot) return false
      socket.emit("active-gate-card", {
        roomId,
        gateId: action.gateId,
        slot: action.slot,
        userId,
      })
      return true
    }
    case "ACTIVE_GATE_CARD": {
      const slot = action.data.id
      const gateId = action.data.portalCard?.key
      if (!slot || !gateId) return false
      socket.emit("active-gate-card", { roomId, gateId, slot, userId })
      return true
    }
    case "USE_ABILITY_CARD": {
      const selection = chooseFirst(action.data)
      const ability = chooseFirst(selection?.abilities)
      if (!selection || !ability) return false
      socket.emit("use-ability-card", {
        roomId,
        abilityId: ability.key,
        slot: selection.slot,
        userId,
        bakuganKey: selection.bakuganKey,
      })
      return true
    }
    case "CHANGE_ATTRIBUTE": {
      const selection = chooseFirst(action.data)
      const attribut = chooseFirst(selection?.attributs)
      if (!selection || !attribut) return false
      socket.emit("change-attribut", {
        roomId,
        attribut,
        bakugan: selection.target,
        userId,
      })
      return true
    }
    default:
      return false
  }
}

const handleTurnActionRequest = (
  socket: Socket,
  roomId: string,
  userId: string,
  request: TurnActionRequest
) => {
  for (const category of ["mustDo", "mustDoOne", "optional"] as const) {
    for (const action of request.actions[category]) {
      if (handleAction(socket, roomId, userId, action)) {
        return
      }
    }
  }

  socket.emit("turn-action", { roomId, userId })
}

const buildGateCardResolution = (
  request: gateCardActionRequestsType
): { data: resolutionGateCardDataType } => {
  const data = request.data

  if (data.type === "SELECT_ABILITY_CARD") {
    const choice = chooseFirst(data.data)
    if (choice) {
      return {
        data: {
          type: "SELECT_ABILITY_CARD",
          cardOwnerId: data.target ? data.target : request.userId,
          card: choice,
        },
      }
    }
  }

  if (data.type === "SELECT_BAKUGAN_TO_SET") {
    const choice = chooseFirst(data.bakugans)
    if (choice) {
      return { data: { type: "SELECT_BAKUGAN_TO_SET", bakugan: choice } }
    }
  }

  return { data: { type: "SKIP_ACTION" } }
}

const buildAbilityResolution = (
  request: AbilityCardsActionsRequestsType
): { data: resolutionDataType | { type: "SKIP_ACTION" } } => {
  const data = request.data

  if (data.type === "SELECT_SLOT") {
    const choice = chooseFirst(data.slots)
    if (choice) {
      return { data: { type: "SELECT_SLOT", slot: choice } }
    }
  }

  if (data.type === "SELECT_BAKUGAN_TO_SET") {
    const choice = chooseFirst(data.bakugans)
    if (choice) {
      return { data: { type: "SELECT_BAKUGAN_TO_SET", bakugan: choice } }
    }
  }

  if (data.type === "MOVE_BAKUGAN_TO_ANOTHER_SLOT") {
    const bakugan = chooseFirst(data.bakugans)
    const slot = chooseFirst(data.slots)
    if (bakugan && slot) {
      return { data: { type: "MOVE_BAKUGAN_TO_ANOTHER_SLOT", bakugan, slot } }
    }
  }

  if (data.type === "SELECT_BAKUGAN_ON_DOMAIN") {
    const bakugan = chooseFirst(data.bakugans)
    if (bakugan) {
      return {
        data: {
          type: "SELECT_BAKUGAN_ON_DOMAIN",
          bakugan: bakugan.key,
          slot: request.slot,
          userId: request.userId,
        },
      }
    }
  }

  if (data.type === "ATTRACT_BAKUGAN") {
    const bakugan = chooseFirst(data.bakugans)
    if (bakugan) {
      return { data: { type: "ATTRACT_BAKUGAN", bakugan } }
    }
  }

  if (data.type === "SELECT_ABILITY_CARD") {
    const card = chooseFirst(data.data)
    if (card) {
      return {
        data: {
          type: "SELECT_ABILITY_CARD",
          cardOwnerId: data.target ? data.target : request.userId,
          card,
        },
      }
    }
  }

  return { data: { type: "SKIP_ACTION" } }
}

const createBotPlayer = (bot: BotAccount, serverUrl: string) => {
  let roomId: string | null = null
  let actionQueue: Promise<void> = Promise.resolve()

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
    roomId = null
  })

  const joinRoom = (matchedRoomId: string) => {
    roomId = matchedRoomId
    socket.emit("init-room-state", {
      roomId: matchedRoomId,
      userId: bot.userId,
      parentSocket: socket.id,
      isSpectator: false,
    })

    // Filet de sécurité si l'init a raté (état pas encore prêt)
    setTimeout(() => {
      if (roomId !== matchedRoomId) return
      socket.emit("get-room-state", {
        roomId: matchedRoomId,
        userId: bot.userId,
        parentSocket: socket.id,
        isSpectator: false,
      })
    }, 500)
  }

  socket.on("match-found", (matchedRoomId: string) => {
    console.log(`[BOT ${bot.userId}] match found:`, matchedRoomId)
    joinRoom(matchedRoomId)
  })

  socket.on("game-finished", () => {
    console.log(`[BOT ${bot.userId}] game finished`)
    roomId = null
  })

  socket.on("turn-action-request", (request: TurnActionRequest) => {
    if (!roomId) return
    const currentRoomId = roomId
    enqueue(() => handleTurnActionRequest(socket, currentRoomId, bot.userId, request))
  })

  socket.on("gate-card-additional-request", (request: gateCardActionRequestsType) => {
    if (!roomId) return
    enqueue(() => {
      const resolution = buildGateCardResolution(request)
      socket.emit("gate-card-additional-request", {
        roomId: request.roomId,
        userId: request.userId,
        cardKey: request.cardKey,
        slot: request.slot,
        ...resolution,
      })
    })
  })

  socket.on("ability-additional-request", (request: AbilityCardsActionsRequestsType) => {
    if (!roomId) return
    enqueue(() => {
      const resolution = buildAbilityResolution(request)
      socket.emit("ability-additional-request", {
        roomId: request.roomId,
        userId: request.userId,
        cardKey: request.cardKey,
        bakuganKey: request.bakuganKey,
        slot: request.slot,
        ...resolution,
      })
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
