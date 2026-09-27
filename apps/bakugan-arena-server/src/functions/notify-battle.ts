import { stateType } from "@bakugan-arena/game-data"
import { Server } from "socket.io"
import { connectedUsers } from "../game-state/battle-brawlers-game-state"

export type BattleNotificationKind = "action-required" | "opponent-action" | "game-finished"

/** Action de l'adversaire, pour un libellé de notification informatif. */
export type OpponentActionType =
    | "set-bakugan"
    | "select-gate"
    | "set-gate"
    | "activate-gate"
    | "use-ability"
    | "change-attribute"
    | "pass-turn"
    | "resolve-ability"
    | "resolve-gate"

export type BattleNotificationPayload = {
    roomId: string
    kind: BattleNotificationKind
    opponentName: string
    at: number
    /** Uniquement pour `kind: "opponent-action"`. */
    action?: OpponentActionType
}

/**
 * Notification « hors partie » : elle part sur le socket GLOBAL du joueur
 * (`connectedUsers`), pas sur son `gameboardSocket`.
 *
 * C'est toute la raison d'être de ce module : `gameboardSocket` n'est renseigné
 * que pendant que le joueur est sur la page battlefield, donc inutilisable pour
 * prévenir quelqu'un qui est justement ailleurs. `connectedUsers` est maintenu
 * au connect/disconnect, il reste valide sur toutes les routes.
 *
 * Le serveur n'essaie pas de deviner où se trouve le joueur : il envoie
 * toujours, et le client décide d'afficher ou non (voir
 * `battle-notification-listener.tsx`). Un bot n'étant pas dans `connectedUsers`,
 * l'appel est un no-op pour lui.
 */
export function notifyBattle({
    io,
    roomState,
    userId,
    kind,
    action,
}: {
    io: Server
    roomState: stateType
    userId: string
    kind: BattleNotificationKind
    action?: OpponentActionType
}) {
    const target = connectedUsers.find((u) => u.userId === userId)
    if (!target) return

    const opponent = roomState.players.find((p) => p.userId !== userId)

    const payload: BattleNotificationPayload = {
        roomId: roomState.roomId,
        kind,
        opponentName: opponent?.username ?? "",
        at: Date.now(),
        ...(action ? { action } : {}),
    }

    io.to(target.socketId).emit("battle-notification", payload)
}

/**
 * Prévient les AUTRES joueurs qu'un joueur vient d'agir. L'acteur lui-même est
 * exclu : il sait ce qu'il vient de faire.
 */
export function notifyOpponentAction({
    io,
    roomState,
    actorUserId,
    action,
}: {
    io: Server
    roomState: stateType
    actorUserId: string
    action: OpponentActionType
}) {
    for (const player of roomState.players) {
        if (player.userId === actorUserId) continue
        notifyBattle({ io, roomState, userId: player.userId, kind: "opponent-action", action })
    }
}

/**
 * Rooms déjà notifiées d'une fin de partie. `stopAllRoomClocks` peut être
 * appelé plusieurs fois sur la même fin (forfait puis CheckGameFinished),
 * sans ce garde le joueur recevrait plusieurs toasts identiques.
 */
const finishNotified = new Set<string>()

export function notifyBattleFinished({ io, roomState }: { io: Server; roomState: stateType }) {
    if (finishNotified.has(roomState.roomId)) return
    finishNotified.add(roomState.roomId)

    for (const player of roomState.players) {
        notifyBattle({ io, roomState, userId: player.userId, kind: "game-finished" })
    }
}

/** Appelé au nettoyage de la room : la room peut être rejouée / recréée. */
export function clearBattleNotificationState(roomId: string) {
    finishNotified.delete(roomId)
}
