import type { Message } from "@bakugan-arena/game-data/src/type/animations-directives";
import gsap from "gsap";

export const removePreviousDialogBoxAnimation = (target: HTMLElement | null, delay: number = 0) => {
    if (target === null) return
    gsap.fromTo(target, {
        opacity: 1
    }, {
        opacity: 0,
        delay: delay,
        onComplete: () => {
            target.remove()
        }
    })
}

export const newDialogBoxAnimation = (target: HTMLElement | null) => {
    if (target === null) return

    const timeline = gsap.timeline()

    timeline.fromTo(target, {
        opacity: 0,
        y: 75
    }, {
        opacity: 1,
        y: 0
    })
}

export async function ShowMessageAnimation({ messages }: { messages: Message[] | undefined }) {

    if (!messages) return

    const previousDialogBox = document.getElementById('dialog-box')
    // removePreviousDialogBoxAnimation(previousDialogBox)


    if (!previousDialogBox) {
        const newDialogBox = document.createElement('div')
        newDialogBox.classList.add('dialog-box')
        newDialogBox.id = 'dialog-box'
        document.body.appendChild(newDialogBox)
        newDialogBoxAnimation(newDialogBox)
    }

    const dialog = document.getElementById('dialog-box')

    messages.forEach((message) => {
        const messageContainer = document.createElement('p')
        const textContent = message.userName ? `${message.userName} : ${message.text}` : `${message.text}`
        messageContainer.textContent = textContent
        dialog?.appendChild(messageContainer)
    })


}

export function EndGameMessage({ message }: { message: Message | undefined }) {

    if (!message) return

    const newDialogBox = document.createElement('div')
    newDialogBox.classList.add('dialog-box')
    newDialogBox.id = 'end-game-dialog-box'
    document.body.appendChild(newDialogBox)

    const textContent = `${message.text}`
    const messageContainer = document.createElement('p')
    messageContainer.textContent = textContent
    newDialogBox.appendChild(messageContainer)
    newDialogBoxAnimation(newDialogBox)
}

export function AdditionalEffectMessage({ message }: { message: string }) {

    const newDialogBox = document.createElement('div')
    newDialogBox.classList.add('dialog-box')
    newDialogBox.id = 'additional-effect-dialog-box'
    document.body.appendChild(newDialogBox)

    const textContent = `${message}`
    const messageContainer = document.createElement('p')
    messageContainer.textContent = textContent
    newDialogBox.appendChild(messageContainer)
    newDialogBoxAnimation(newDialogBox)
}

export function OnHoverGateCard({ message }: { message: string }) {

    const newDialogBox = document.createElement('div')
    newDialogBox.classList.add('dialog-box')
    newDialogBox.id = 'on-hover-gate-card'
    document.body.appendChild(newDialogBox)

    const textContent = `${message}`
    const messageContainer = document.createElement('p')
    messageContainer.textContent = textContent
    newDialogBox.appendChild(messageContainer)
    newDialogBoxAnimation(newDialogBox)
}