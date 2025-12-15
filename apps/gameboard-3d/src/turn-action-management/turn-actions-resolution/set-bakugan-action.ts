import type { setBakuganProps, slots_id } from "@bakugan-arena/game-data";
import type { ActionRequestAnswerType, ActionType } from "@bakugan-arena/game-data/src/type/actions-serveur-requests";
import { SelectBakugan, SelectSlotToSetBakugan } from "../turn-actions-function/select-slot";
import * as THREE from 'three';
import type { Socket } from "socket.io-client";
import { clearTurnInterface } from "./action-scope";

export function SetBakugan({
    socket,
    SelectedActions,
    actions,
    userId,
    camera,
    plane,
    roomId
}: {
    socket: Socket
    SelectedActions: ActionRequestAnswerType
    actions: ActionType[]
    userId: string
    plane: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>
    camera: THREE.PerspectiveCamera,
    roomId: string
}) {


    const selectBakugan = SelectedActions.find(a => a.type === 'SET_BAKUGAN')
    const bakugans = actions.find(a => a.type === 'SET_BAKUGAN')?.data.bakugans
    const actionsSlots = actions.find(a => a.type === 'SET_BAKUGAN')?.data.setableSlots

    if (!selectBakugan || !bakugans || !actionsSlots) return

    const bakuganToSelect = document.querySelectorAll('.select-bakugan-action')
    if (!bakuganToSelect.length) return

    const bakuganClickHandlers = new Map<Element, EventListener>()
    let mouseMoveHandler: ((event: MouseEvent) => void) | null = null
    let clickHandler: (() => void) | null = null

    function resetSlotsColor(
        plane: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>,
        slots: slots_id[]
    ) {
        slots.forEach((slot) => {
            const mesh = plane.getObjectByName(slot) as THREE.Mesh<
                THREE.PlaneGeometry,
                THREE.MeshBasicMaterial
            >
            if (mesh) {
                mesh.material.color.set('white')
            }
        })
    }

    function cleanupListeners(
        mouseMoveHandler: ((event: MouseEvent) => void) | null,
        clickHandler: (() => void) | null,
        cleanAll: boolean
    ) {
        if (mouseMoveHandler)
            window.removeEventListener('mousemove', mouseMoveHandler)

        if (clickHandler)
            window.removeEventListener('click', clickHandler)

        if (cleanAll) {
            bakuganClickHandlers.forEach((handler, el) => {
                el.removeEventListener('click', handler)
            })

            bakuganClickHandlers.clear()
        }
    }

    const cleanup = (slots: slots_id[], cleanAll: boolean) => {
        cleanupListeners(mouseMoveHandler, clickHandler, cleanAll)
        resetSlotsColor(plane, slots)
        mouseMoveHandler = null
        clickHandler = null
    }

    let hoveredSlot: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial> | null = null

    bakuganToSelect.forEach((bakugan) => {
        const data = bakugans.find(b => b.key === bakugan.getAttribute('data-key'))
        if (!data) return

        const handler = () => {
            const gateSlot = SelectedActions
                .find(a => a.type === 'SET_GATE_CARD_ACTION')
                ?.data?.slot

            const slots: slots_id[] = gateSlot
                ? [...actionsSlots, gateSlot]
                : actionsSlots

            cleanup(slots, false)

            SelectBakugan({
                bakuganToSelect,
                bakugan,
                data,
                selectBakugan,
                slots,
                userId
            })

            console.log(selectBakugan.data)

            if (!selectBakugan.data || selectBakugan.data.key !== data.key) return


            mouseMoveHandler = (event: MouseEvent) => {
                hoveredSlot = SelectSlotToSetBakugan({
                    plane,
                    slots,
                    hoveredSlot,
                    camera,
                    event,
                    attribut: data.attribut
                })
            }

            clickHandler = () => {
                if (!selectBakugan.data || !hoveredSlot) return

                selectBakugan.data.slot = hoveredSlot.name as slots_id

                const payload: setBakuganProps = {
                    bakuganKey: selectBakugan.data.key,
                    roomId: roomId,
                    slot: selectBakugan.data.slot,
                    userId: userId
                }

                cleanup(slots, true)
                hoveredSlot = null

                console.log(payload)

                clearTurnInterface()

                socket.emit('set-bakugan', ({ roomId: payload.roomId, bakuganKey: payload.bakuganKey, slot: payload.slot, userId: payload.userId }))

                console.log('actions', actions)

                if (actions.length === 1) {
                    socket.emit('turn-action', ({ roomId: roomId, userId: userId }))
                }

            }

            window.addEventListener('mousemove', mouseMoveHandler)
            window.addEventListener('click', clickHandler)
        }


        bakugan.addEventListener('click', handler)
        bakuganClickHandlers.set(bakugan, handler)
    })
}
