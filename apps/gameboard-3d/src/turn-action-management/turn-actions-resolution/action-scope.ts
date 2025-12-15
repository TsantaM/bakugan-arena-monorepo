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
}