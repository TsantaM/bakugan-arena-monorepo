import { AnimationDirectivesTypes, MessageToIframe, portalSlotsType } from "@bakugan-arena/game-data";

export function InitGameRoomMessage({ iframe, slots, userId, token, roomId }: { iframe: HTMLIFrameElement, slots: portalSlotsType, userId: string, token: string, roomId: string }) {

    const message: MessageToIframe = {
        type: "INIT_GAME_ROOM",
        data: {
            slots: slots,
            userId: userId
        },
        token: token,
        roomId: roomId,
        userId: userId
    }

    if(iframe.contentWindow === null) return
    iframe.contentWindow.postMessage(message, 'http://localhost:5173/')

}


export function SendAnimationsMessage({ iframe, animation, token, userId, roomId }: { iframe: HTMLIFrameElement, animation: AnimationDirectivesTypes, token: string, userId: string, roomId: string }) {
    const message: MessageToIframe = {
        type: 'TURN_ACTION_ANIMATION',
        data: animation,
        token: token,
        roomId: roomId,
        userId: userId
    }
    if(iframe.contentWindow === null) return
    iframe.contentWindow.postMessage(message, 'http://localhost:5173/')
}