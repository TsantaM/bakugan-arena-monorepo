import type { ActionType, ActivePlayerActionRequestType, InactivePlayerActionRequestType } from "@bakugan-arena/game-data";
import type { Socket } from "socket.io-client";
import { clearTurnInterface } from "./action-scope";
import { emitPassTurnFromBridge } from "../turn-action-bridge";

export function NextTurnButtonAction({ request, socket, userId, roomId, globalCleanUp }: {
    socket: Socket,
    request: ActivePlayerActionRequestType | InactivePlayerActionRequestType,
    userId: string,
    roomId: string,
    globalCleanUp?: () => void
}) {

    let clickHandler: (() => void) | null = null

    const turnActionButton = document.getElementById('next-turn-button')
    if (!turnActionButton) return

    function cleanup() {
        if (clickHandler) {
            turnActionButton?.removeEventListener('click', clickHandler)
            clickHandler = null
        }
    }

    clickHandler = () => {
        const mustDo: ActionType[] = request.actions.mustDo
        const mustDoOne: ActionType[] = request.actions.mustDoOne

        if (mustDo.length > 0) return
        if (mustDoOne.length > 0) return

        if(globalCleanUp) globalCleanUp()

        if (!emitPassTurnFromBridge(socket, roomId, userId)) return

        clearTurnInterface()
        cleanup()
    }

    turnActionButton.addEventListener('click', clickHandler)

}