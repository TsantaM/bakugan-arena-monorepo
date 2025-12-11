import type { ActionRequestAnswerType, ActionType } from "@bakugan-arena/game-data/src/type/actions-serveur-requests"
import * as THREE from 'three'
import { type slots_id } from "@bakugan-arena/game-data"
import { createOverableSlot, SelectCard, SelectSlotOnMouseMove } from "../turn-actions-function/select-slot"

export function SetGateCard({ userId, SelectedActions, actions, camera, plane }: {
    userId: string,
    SelectedActions: ActionRequestAnswerType
    actions: ActionType[],
    camera: THREE.PerspectiveCamera,
    scene: THREE.Scene<THREE.Object3DEventMap>,
    plane: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial, THREE.Object3DEventMap>
}) {

    const selectGateCard = SelectedActions.find((action) => action.type === 'SET_GATE_CARD_ACTION')
    const cards = actions.find((action) => action.type === 'SET_GATE_CARD_ACTION')?.data.cards
    const slots = actions.find((action) => action.type === 'SET_GATE_CARD_ACTION')?.data.slots
    if (!selectGateCard) return
    if (!cards) return
    if (!slots) return

    const cardsToSelect = document.querySelectorAll('.card-selecter');
    const currentCameraPosition = structuredClone(camera.position)
    console.log(currentCameraPosition)

    cardsToSelect.forEach(card => {
        card.addEventListener('click', () => {
            const data = cards.find((c) => c.key === card.getAttribute('data-key'))
            if (!data) return
            console.log(data)

            SelectCard({
                card: card,
                cardsToSelect: cardsToSelect,
                data: data,
                plane: plane,
                selectGateCard: selectGateCard,
                userId: userId,
                slots: slots
            })

            if (selectGateCard.data && selectGateCard.data.key === data.key) {
                alert('3')
                slots.forEach((slot) => createOverableSlot(slot, plane, data, true))
                let hoveredSlot: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial, THREE.Object3DEventMap> | null = null

                window.addEventListener('mousemove', (event: MouseEvent) => {
                    const newHoveredSlot = SelectSlotOnMouseMove({
                        plane: plane,
                        slots: slots,
                        hoveredSlot: hoveredSlot,
                        camera: camera,
                        event: event
                    })
                    hoveredSlot = newHoveredSlot
                })

                window.addEventListener('click', () => {
                    if (!selectGateCard.data) return
                    if (hoveredSlot) {
                        selectGateCard.data.slot = hoveredSlot.name as slots_id
                        console.log(selectGateCard.data)
                        hoveredSlot = null
                        // Nettoyage des slots affichés
                        slots.forEach((slot) => {
                            const slotMesh = plane.getObjectByName(slot)
                            if (slotMesh && slotMesh.userData.classes.includes("overable")) {
                                plane.remove(slotMesh)
                            }
                        })

                        const data = cards.find((c) => c.key === selectGateCard.data?.key)
                        if (!data) return
                        // alert('first pass')
                        console.log("3", plane.children.map((c) => c.name))

                        createOverableSlot(selectGateCard.data.slot, plane, data, false)
                    }
                })
            }

            return
        })
    })

}