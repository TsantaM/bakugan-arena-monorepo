import { MessageToIframe, portalSlotsType } from "@bakugan-arena/game-data";

export function InitGameRoomMessage( {iframe, slots, userId } : { iframe: HTMLIFrameElement, slots: portalSlotsType, userId: string }) {

    const message: MessageToIframe = {
        type: "INIT_GAME_ROOM",
        data: {
            slots: slots,
            userId: userId
        }
    }

    console.log(message)
    iframe.contentWindow?.postMessage(message, 'http://localhost:5173/')
    console.log(iframe.contentWindow)

}