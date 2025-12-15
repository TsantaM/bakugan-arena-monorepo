import type { ActionRequestAnswerType, ActionType } from "@bakugan-arena/game-data/src/type/actions-serveur-requests"
import * as THREE from 'three'
import { type slots_id } from "@bakugan-arena/game-data"
import { createOverableSlot, SelectCard, SelectSlotOnMouseMove } from "../turn-actions-function/select-slot"
import { Socket } from "socket.io-client"
import { clearTurnInterface } from "./action-scope"


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

    const cardsToSelect = document.querySelectorAll('.card-selecter')
    if (!cardsToSelect.length) return

    const cardClickHandlers = new Map<Element, EventListener>()
    let mouseMoveHandler: ((e: MouseEvent) => void) | null = null
    let clickHandler: (() => void) | null = null

    function cleanup(cleanAll: boolean) {
        if (mouseMoveHandler)
            window.removeEventListener('mousemove', mouseMoveHandler)

        if (clickHandler)
            window.removeEventListener('click', clickHandler)

        if (cleanAll) {
            cardClickHandlers.forEach((handler, el) => {
                el.removeEventListener('click', handler)
            })
        }

        cardClickHandlers.clear()
        mouseMoveHandler = null
        clickHandler = null
    }

    cardsToSelect.forEach(card => {
        const handler = () => {
            const data = cards.find(c => c.key === card.getAttribute('data-key'))
            if (!data) return

            cleanup(false) // 🔒 garantit un seul flow actif

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

                if (actions.length === 1) {
                    socket.emit('turn-action', { roomId, userId })
                }

                cleanup(true)
            }

            window.addEventListener('mousemove', mouseMoveHandler)
            window.addEventListener('click', clickHandler)
        }

        card.addEventListener('click', handler)
        cardClickHandlers.set(card, handler)
    })

    // 🔑 option pro : retour d’un destroy explicite
    return cleanup
}
