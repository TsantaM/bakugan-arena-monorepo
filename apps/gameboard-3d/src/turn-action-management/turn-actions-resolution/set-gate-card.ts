import type { ActionRequestAnswerType, ActionType } from "@bakugan-arena/game-data"
import * as THREE from 'three'
import { type slots_id } from "@bakugan-arena/game-data"
import { createOverableSlot, SelectCard, SelectSlotOnMouseMove } from "../turn-actions-function/select-slot"
import { Socket } from "socket.io-client"
import { clearTurnInterface } from "./action-scope"
import gsap from "gsap"


export function SetGateCard({
    socket,
    userId,
    SelectedActions,
    actions,
    camera,
    plane,
    roomId
}: {
    socket: Socket
    userId: string
    SelectedActions: ActionRequestAnswerType
    actions: ActionType[]
    camera: THREE.PerspectiveCamera
    plane: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>
    roomId: string
}) {

    const selectGateCard = SelectedActions.find(a => a.type === 'SET_GATE_CARD_ACTION')
    const cards = actions.find(a => a.type === 'SET_GATE_CARD_ACTION')?.data.cards
    const slots = actions.find(a => a.type === 'SET_GATE_CARD_ACTION')?.data.slots

    if (!selectGateCard || !cards || !slots) return

    const cardsToSelect = document.querySelectorAll('.gate-card-selecter')
    if (!cardsToSelect.length) return

    const cardClickHandlers = new Map<Element, EventListener>()
    let mouseEnter: (() => void) | null = null
    let mouseMoveHandler: ((e: MouseEvent) => void) | null = null
    let clickHandler: (() => void) | null = null
    let mouseLeave: (() => void) | null = null

    function cleanup(cleanAll: boolean, card: Element) {
        if (mouseMoveHandler)
            window.removeEventListener('mousemove', mouseMoveHandler)

        if (clickHandler)
            window.removeEventListener('click', clickHandler)

        if (cleanAll) {
            cardClickHandlers.forEach((handler, el) => {
                el.removeEventListener('click', handler)
            })
            if (mouseEnter) {
                card.removeEventListener('mouseenter', mouseEnter)
            }
            if (mouseLeave) {
                card.removeEventListener('mouseleave', mouseLeave)
            }
        }

        cardClickHandlers.clear()
        mouseEnter = null
        mouseLeave = null
        mouseMoveHandler = null
        clickHandler = null
    }

    cardsToSelect.forEach(card => {

        mouseEnter = () => {
            const data = cards.find(c => c.key === card.getAttribute('data-key'))
            if (!data) return

            let hoveredCardDescription = document.querySelectorAll('.card-description')

            if (!hoveredCardDescription) return

            hoveredCardDescription.forEach((description) => {
                if (description.getAttribute('data-key') === data.key) {
                    gsap.fromTo(description, {
                        display: 'none',
                        opacity: 0
                    }, {
                        display: 'block',
                        opacity: 1,
                        duration: 0.1
                    })
                }
            })

        }

        mouseLeave = () => {
            const data = cards.find(c => c.key === card.getAttribute('data-key'))
            if (!data) return

            let hoveredCardDescription = document.querySelectorAll('.card-description')

            if (!hoveredCardDescription) return

            hoveredCardDescription.forEach((description) => {
                gsap.to(description, {
                    opacity: 0,
                    display: 'none',
                    duration: 0.1
                })
            })
        }

        const handler = () => {
            const data = cards.find(c => c.key === card.getAttribute('data-key'))
            if (!data) return

            cleanup(false, card) // 🔒 garantit un seul flow actif

            SelectCard({
                card,
                cardsToSelect,
                data,
                plane,
                selectGateCard,
                userId,
                slots
            })

            if (!selectGateCard.data || selectGateCard.data.key !== data.key)
                return

            slots.forEach(slot => createOverableSlot(slot, plane, data, true))

            let hoveredSlot: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial> | null = null

            mouseMoveHandler = (event) => {
                hoveredSlot = SelectSlotOnMouseMove({
                    plane,
                    slots,
                    hoveredSlot,
                    camera,
                    event
                })
            }

            clickHandler = () => {
                if (!selectGateCard.data || !hoveredSlot) return

                selectGateCard.data.slot = hoveredSlot.name as slots_id

                slots.forEach(slot => {
                    const mesh = plane.getObjectByName(slot)
                    if (mesh && mesh.userData.classes?.includes("overable")) {
                        plane.remove(mesh)
                    }
                })

                clearTurnInterface()


                socket.emit('set-gate', {
                    roomId,
                    gateId: selectGateCard.data.key,
                    slot: selectGateCard.data.slot,
                    userId
                })

                cleanup(true, card)
            }

            window.addEventListener('mousemove', mouseMoveHandler)
            window.addEventListener('click', clickHandler)
        }
        card.addEventListener('mouseenter', mouseEnter)
        card.addEventListener('mouseleave', mouseLeave)
        card.addEventListener('click', handler)
        cardClickHandlers.set(card, handler)
    })

    // 🔑 option pro : retour d’un destroy explicite
    return cleanup
}
