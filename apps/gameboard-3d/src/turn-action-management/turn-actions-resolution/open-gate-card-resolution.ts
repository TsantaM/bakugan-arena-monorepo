import type { ActionType } from "@bakugan-arena/game-data";
import type { Socket } from "socket.io-client";
import { clearTurnInterface } from "./action-scope";
import type { activeGateCardProps } from "@bakugan-arena/game-data";

export function OpenGateCardResolution({ actions: actions, socket: socket, userId: userId, roomId: roomId }: {
    socket: Socket,
    actions: ActionType[],
    userId: string,
    roomId: string
}) {

    const Opener = document.getElementById('open-gate-card-button')
    if (!Opener) return

    const openGateCardAction = actions.find((action) => action.type === 'OPEN_GATE_CARD')
    if (!openGateCardAction) return

    let clickHandler: (() => void) | null = null

    function cleanup() {
        if (clickHandler) {
            Opener?.removeEventListener('click', clickHandler)
            clickHandler = null
        }
    }

    clickHandler = () => {

        const { gateId, slot }: activeGateCardProps = {
            gateId: openGateCardAction.gateId,
            roomId: roomId,
            slot: openGateCardAction.slot,
            userId: userId
        }

        socket.emit('active-gate-card', ({ roomId, gateId, slot, userId }))

        clearTurnInterface()
        cleanup()
    }

    Opener.addEventListener('click', clickHandler)


}