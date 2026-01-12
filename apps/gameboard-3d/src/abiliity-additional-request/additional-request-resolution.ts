import type { AbilityCardsActionsRequestsType, resolutionType } from "@bakugan-arena/game-data/src/type/actions-serveur-requests";
import { SelectBakuganOnMouseMove, SelectSlotToSetBakugan } from "../turn-action-management/turn-actions-function/select-slot";
import * as THREE from 'three'
import type { Socket } from "socket.io-client";
import { clearTurnInterface } from "../turn-action-management/turn-actions-resolution/action-scope";
import { BakuganList, type attribut, type slots_id } from "@bakugan-arena/game-data";
import { getAttributColor } from "../functions/get-attrubut-color";
import { BuildBakuganSelecterCards } from "../turn-action-management/turn-action-builder/build-select-bakugan";
import type { bakuganInDeck } from "@bakugan-arena/game-data/src/type/room-types";
import { removePreviousDialogBoxAnimation } from "../animations/show-message-animation";


export function AdditionalRequestResolution({ request, camera, plane, socket, scene }: {
    request: AbilityCardsActionsRequestsType, plane: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial, THREE.Object3DEventMap>, camera: THREE.PerspectiveCamera, socket: Socket, scene: THREE.Scene<THREE.Object3DEventMap>
}) {

    // alert(`'eh': ${request.data.type}`)

    if (request.data.type === 'SELECT_SLOT') {
        const slots = request.data.slots

        let mouseMove: ((event: MouseEvent) => void) | null = null
        let clickHandler: (() => void) | null = null

        let hoveredSlot: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial, THREE.Object3DEventMap> | null = null

        const cleanUp = () => {
            if (mouseMove) {
                window.removeEventListener('mousemove', mouseMove),
                    mouseMove = null
            }

            if (clickHandler) {
                window.removeEventListener('click', clickHandler)
                clickHandler = null
            }
        }

        mouseMove = (event: MouseEvent) => {

            const attribut: attribut = BakuganList.find((bakugan) => bakugan.key === request.bakuganKey)?.attribut || 'Pyrus'

            hoveredSlot = SelectSlotToSetBakugan({
                attribut: attribut,
                camera: camera,
                event: event,
                hoveredSlot: hoveredSlot,
                plane: plane,
                slots: slots
            })


            if (hoveredSlot === null) return

            clickHandler = () => {

                if (!hoveredSlot) return

                slots.forEach(slot => {
                    const mesh = plane.getObjectByName(slot)
                    if (mesh && mesh.userData.classes?.includes("overable")) {
                        plane.remove(mesh)
                    }
                })

                const resolution: resolutionType = {
                    cardKey: request.cardKey,
                    userId: request.userId,
                    bakuganKey: request.bakuganKey,
                    slot: request.slot,
                    roomId: request.roomId,
                    data: {
                        type: 'SELECT_SLOT',
                        slot: hoveredSlot.name as slots_id
                    }
                }

                socket.emit('ability-additional-request', resolution)

                slots.forEach((slot) => {
                    const mesh = plane.getObjectByName(slot) as THREE.Mesh<
                        THREE.PlaneGeometry,
                        THREE.MeshBasicMaterial
                    >
                    if (mesh) {
                        mesh.material.color.set('white')
                    }
                })

                clearTurnInterface()
                const additionalEffectsBox = document.getElementById('additional-effect-dialog-box')
                removePreviousDialogBoxAnimation(additionalEffectsBox)
                cleanUp()
            }

            window.addEventListener('click', clickHandler)
        }
        window.addEventListener('mousemove', mouseMove)
    }

    if (request.data.type === 'MOVE_BAKUGAN_TO_ANOTHER_SLOT') {
        const bakugans = request.data.bakugans
        const slots = request.data.slots


        let bakugan: THREE.Sprite | null = null
        let hoveredSlot: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial> | null = null

        let mouseMove: ((e: MouseEvent) => void) | null = null
        let clickHandler: (() => void) | null = null

        const bakuganNames = bakugans.map(b => `${b.key}-${b.userId}`)

        const cleanUp = () => {
            if (mouseMove) {
                window.removeEventListener('mousemove', mouseMove)
                mouseMove = null
            }
            if (clickHandler) {
                window.removeEventListener('click', clickHandler)
                clickHandler = null
            }
            clearTurnInterface()
        }

        /* =========================
           PHASE 1 — SELECT BAKUGAN
           ========================= */

        mouseMove = (event: MouseEvent) => {
            bakugan = SelectBakuganOnMouseMove({
                camera,
                event,
                scene,
                names: bakuganNames,
                bakugan
            })
        }

        clickHandler = () => {
            if (!bakugan) return

            // Feedback visuel
            const color = new THREE.Color(getAttributColor(bakugan.userData.attribut))
            bakugan.material.color.set(color)

            // On stoppe la phase bakugan
            cleanUp()

            /* ======================
               PHASE 2 — SELECT SLOT
               ====================== */

            let slotMouseMove: ((e: MouseEvent) => void) | null = null
            let slotClick: (() => void) | null = null

            const slotCleanUp = () => {
                if (slotMouseMove) {
                    window.removeEventListener('mousemove', slotMouseMove)
                    slotMouseMove = null
                }
                if (slotClick) {
                    window.removeEventListener('click', slotClick)
                    slotClick = null
                }
                clearTurnInterface()
                bakugan?.material.color.set('white');
                hoveredSlot?.userData.isCanceled ? hoveredSlot.material.color.set(0.1, 0.1, 0.1) : hoveredSlot?.material.color.set('white')
            }

            slotMouseMove = (event: MouseEvent) => {
                hoveredSlot = SelectSlotToSetBakugan({
                    attribut: bakugan!.userData.attribut,
                    camera,
                    event,
                    hoveredSlot,
                    plane,
                    slots
                })
            }

            slotClick = () => {
                if (!bakugan) return
                if (bakugan === null) return
                if (!hoveredSlot) return

                const selectedBakuganData = bakugans.find((b) => b.key === bakugan?.userData.bakuganKey)

                if (!selectedBakuganData) return

                const resolution: resolutionType = {
                    cardKey: request.cardKey,
                    userId: request.userId,
                    bakuganKey: request.bakuganKey,
                    slot: request.slot,
                    roomId: request.roomId,
                    data: {
                        type: 'MOVE_BAKUGAN_TO_ANOTHER_SLOT',
                        bakugan: selectedBakuganData,
                        slot: hoveredSlot.name as slots_id
                    }
                }

                socket.emit('ability-additional-request', resolution)
                slotCleanUp()
                const additionalEffectsBox = document.getElementById('additional-effect-dialog-box')
                removePreviousDialogBoxAnimation(additionalEffectsBox)
            }

            window.addEventListener('mousemove', slotMouseMove)
            window.addEventListener('click', slotClick)
        }

        window.addEventListener('mousemove', mouseMove)
        window.addEventListener('click', clickHandler)
    }

    if (request.data.type === 'SELECT_BAKUGAN_ON_DOMAIN') {
        const bakugans = request.data.bakugans

        let bakugan: THREE.Sprite | null = null

        let mouseMove: ((e: MouseEvent) => void) | null = null
        let clickHandler: (() => void) | null = null

        const bakuganNames = bakugans.map(b => `${b.key}-${b.userId}`)

        const cleanUp = () => {
            if (mouseMove) {
                window.removeEventListener('mousemove', mouseMove)
                mouseMove = null
            }
            if (clickHandler) {
                window.removeEventListener('click', clickHandler)
                clickHandler = null
            }
            clearTurnInterface()
        }

        /* =========================
           SELECT BAKUGAN
           ========================= */

        mouseMove = (event: MouseEvent) => {
            bakugan = SelectBakuganOnMouseMove({
                camera,
                event,
                scene,
                names: bakuganNames,
                bakugan
            })
        }

        clickHandler = () => {
            if (!bakugan) return

            // Feedback visuel
            const color = new THREE.Color(getAttributColor(bakugan.userData.attribut))
            bakugan.material.color.set(color)

            // On stoppe la phase 

            const slot = bakugans.find((b) => b.key === bakugan?.userData.bakuganKey)?.slot

            if (!slot) return
            const resolution: resolutionType = {
                bakuganKey: request.bakuganKey,
                cardKey: request.cardKey,
                data: {
                    type: 'SELECT_BAKUGAN_ON_DOMAIN',
                    bakugan: bakugan.userData.bakuganKey,
                    slot: slot
                },
                roomId: request.roomId,
                slot: request.slot,
                userId: request.userId
            }

            bakugan?.material.color.set('white');

            socket.emit('ability-additional-request', resolution)
            cleanUp()
            const additionalEffectsBox = document.getElementById('additional-effect-dialog-box')
            removePreviousDialogBoxAnimation(additionalEffectsBox)
        }

        window.addEventListener('mousemove', mouseMove)
        window.addEventListener('click', clickHandler)

    }

    if (request.data.type === 'SELECT_BAKUGAN_TO_SET') {
        
        BuildBakuganSelecterCards({
            bakugans: request.data.bakugans
        })

        let mouseMove: (() => void) | null = null
        let clickHandler: (() => void) | null = null
        let mouseLeave: (() => void) | null = null

        const bakugansToSelect = document.querySelectorAll('.image-bakugan-selecter-container')
        if (!bakugansToSelect) return

        let bakugan: bakuganInDeck | null = null

        const cleaner = (bak: Element) => {

            if (mouseMove !== null) {
                bak.removeEventListener('mousemove', mouseMove)
                mouseMove = null
            }

            if (mouseLeave !== null) {
                bak.removeEventListener('mouseleave', mouseLeave)
                mouseLeave = null
            }

            if (clickHandler !== null) {
                window.removeEventListener('click', clickHandler)
                clickHandler = null
            }

            clearTurnInterface()

        }

        bakugansToSelect.forEach((bak) => {

            if (request.data.type !== 'SELECT_BAKUGAN_TO_SET') return

            const data = request.data.bakugans.find((b) => b?.bakuganData.key === bak.getAttribute('data-key'))

            if (!data) {
                bakugan = null
            }

            if (!data) return

            mouseMove = () => {
                if (bakugan !== data) {
                    bakugan = data
                }
            }

            mouseLeave = () => {
                bakugan = null
            }

            clickHandler = () => {
                if (bakugan === null) return
                if (bakugan?.bakuganData.key !== bak.getAttribute('data-key')) return


                const resolution: resolutionType = {
                    bakuganKey: request.bakuganKey,
                    cardKey: request.cardKey,
                    data: {
                        type: 'SELECT_BAKUGAN_TO_SET',
                        bakugan: bakugan
                    },
                    roomId: request.roomId,
                    slot: request.slot,
                    userId: request.userId
                }

                socket.emit('ability-additional-request', resolution)
                cleaner(bak)
                const additionalEffectsBox = document.getElementById('additional-effect-dialog-box')
                removePreviousDialogBoxAnimation(additionalEffectsBox)
            }

            bak.addEventListener('mousemove', mouseMove)
            bak.addEventListener('mouseleave', mouseLeave)
            window.addEventListener('click', clickHandler)
        })

    }

}