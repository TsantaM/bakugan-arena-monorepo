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

/** Signale au parent que le tour courant est terminé. */
export function notifyParentTurnEnd() {
    window.parent.postMessage(
        {
            type: "GAME_TURN_END",
        },
        "*"
    );
}

/** Signale au parent que la file d'animations courante est terminée. */
export function notifyParentAnimationsDone() {
    window.parent.postMessage(
        {
            type: "GAME_ANIMATIONS_DONE",
        },
        "*"
    );
}
