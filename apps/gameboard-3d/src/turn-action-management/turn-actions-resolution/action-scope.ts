import { removePreviousDialogBoxAnimation } from "../../animations/show-message-animation"

// action-scope.ts
class ActionScope {
    private cleaners: (() => void)[] = []

    add(
        target: EventTarget,
        event: string,
        handler: EventListenerOrEventListenerObject
    ) {
        target.addEventListener(event, handler)
        this.cleaners.push(() =>
            target.removeEventListener(event, handler)
        )
    }

    cleanup() {
        this.cleaners.forEach(fn => fn())
        this.cleaners = []
    }
}

export const GlobalActionScope = new ActionScope()


export function clearTurnInterface() {
    const turnInterface = document.querySelector('.turn-interface')
    turnInterface?.remove()
    const turnActionButton = document.getElementById('next-turn-button')
    turnActionButton?.remove()
    const selecter = document.querySelector('.select-one')
    selecter?.remove()
    const stackSelecteOne = document.getElementById('stack-selecte-one')
    stackSelecteOne?.remove()
    const previousDialogBox = document.getElementById('dialog-box')
    removePreviousDialogBoxAnimation(previousDialogBox)
    const existingDescription = document.querySelector('.hovered-card-description');
    existingDescription?.remove();
}