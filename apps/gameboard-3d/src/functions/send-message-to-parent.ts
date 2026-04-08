import type { Message } from "@bakugan-arena/game-data";

export function sendMessageToParent(message: Message[] | undefined) {
    window.parent.postMessage(
        {
            type: "GAME_MESSAGE",
            payload: message
        },
        "*" // en prod: mets ton domaine
    );
}