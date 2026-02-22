import type { ActionRequestAnswerType, ActionType, setBakuganProps, slots_id } from "@bakugan-arena/game-data"
import type { Socket } from "socket.io-client"
import * as THREE from 'three'
import { SelectCard } from "../turn-actions-function/select-card"
import { createOverableSlot } from "../turn-actions-function/create-overable-slot"
import { SelectSlotOnMouseMove } from "../turn-actions-function/select-slot"
import { clearTurnInterface } from "./action-scope"
import { SelectSlotToSetBakugan } from "../turn-actions-function/select-slot-to-set-bakugan"
import { SelectBakugan } from "../turn-actions-function/select-bakugan"
import { SelectBakuganOnMouseMove } from "../turn-actions-function/select-bakugan-on-mouse-move"
import { SelectAbilityCardForStandardTurn } from "../turn-actions-function/select-ability-card-for-standard-turn"

export function TurnInteractionController({
    socket,
    userId,
    SelectedActions,
    actions,
    camera,
    plane,
    scene,
    roomId
}: {
    socket: Socket
    userId: string
    SelectedActions: ActionRequestAnswerType
    actions: ActionType[]
    camera: THREE.PerspectiveCamera
    plane: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>
    scene: THREE.Scene
    roomId: string
}) {

    const cardClickHandlers = new Map<Element, EventListener>()
    const bakuganClickHandlers = new Map<Element, EventListener>()
    let mouseEnter: (() => void) | null = null
    let mouseMoveHandler: ((e: MouseEvent) => void) | null = null
    let clickHandler: (() => void) | null = null
    let mouseLeave: (() => void) | null = null

    let hoveredSlot: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial> | null = null

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
        bakuganClickHandlers.clear()
        mouseEnter = null
        mouseLeave = null
        mouseMoveHandler = null
        clickHandler = null
    }

    // SET GATE CARD 
    const selectGateCard = SelectedActions.find(a => a.type === 'SET_GATE_CARD_ACTION')
    const Gcards = actions.find(a => a.type === 'SET_GATE_CARD_ACTION')?.data.cards
    const slots = actions.find(a => a.type === 'SET_GATE_CARD_ACTION')?.data.slots
    const cardsToSelect = document.querySelectorAll('.gate-card-selecter')

    cardsToSelect.forEach(card => {

        if (!selectGateCard || !Gcards || !slots) return

        mouseEnter = () => {
            const data = Gcards.find(c => c.key === card.getAttribute('data-key'))
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
            const data = Gcards.find(c => c.key === card.getAttribute('data-key'))
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
            const data = Gcards.find(c => c.key === card.getAttribute('data-key'))
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


    // SET BAKUGAN
    const selectBakugan = SelectedActions.find(a => a.type === 'SET_BAKUGAN')
    const TSbakugans = actions.find(a => a.type === 'SET_BAKUGAN')?.data.bakugans
    const actionsSlots = actions.find(a => a.type === 'SET_BAKUGAN')?.data.setableSlots


    const bakuganToSelect = document.querySelectorAll('.select-bakugan-action')

    bakuganToSelect.forEach((bakugan) => {
        if (!selectBakugan || !TSbakugans || !actionsSlots) return
        if (!bakuganToSelect.length) return

        const data = TSbakugans.find(b => b.key === bakugan.getAttribute('data-key'))
        if (!data) return

        const handler = () => {
            const gateSlot = SelectedActions
                .find(a => a.type === 'SET_GATE_CARD_ACTION')
                ?.data?.slot

            const slots: slots_id[] = gateSlot
                ? [...actionsSlots, gateSlot]
                : actionsSlots

            // cleanup(slots, false)

            SelectBakugan({
                bakuganToSelect,
                bakugan,
                data,
                selectBakugan,
                slots,
                userId
            })


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

                // cleanup(slots, true)

                hoveredSlot = null
                clearTurnInterface()

                socket.emit('set-bakugan', ({ roomId: payload.roomId, bakuganKey: payload.bakuganKey, slot: payload.slot, userId: payload.userId }))

            }

            window.addEventListener('mousemove', mouseMoveHandler)
            window.addEventListener('click', clickHandler)
        }


        bakugan.addEventListener('click', handler)
        bakuganClickHandlers.set(bakugan, handler)
    })


    // USE ABILITY CARD
    const cardsToUse = document.querySelectorAll('.ability-card-selecter')
    const useAbilityCard = SelectedActions.find(a => a.type === 'USE_ABILITY_CARD')
    const onBoardBakugans = actions.find(a => a.type === 'USE_ABILITY_CARD')?.data
    const selectAbilityCard = actions.find(a => a.type === 'USE_ABILITY_CARD')


    cardsToUse.forEach(card => {
        if (!onBoardBakugans || !useAbilityCard || !selectAbilityCard) return
        if (!cardsToUse.length) return

        const Abakugans = onBoardBakugans.map((bakugan) => bakugan)

        const Acards = [...new Map(
            onBoardBakugans
                .flatMap(b => b.abilities)
                .map(card => [card.key, card])
        ).values()]

        mouseEnter = () => {
            const data = Acards.find(c => c.key === card.getAttribute('data-key'))
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
            const data = Acards.find(c => c.key === card.getAttribute('data-key'))
            if (!data) return

            let hoveredCardDescription = document.querySelectorAll('.card-description')

            if (!hoveredCardDescription) return

            hoveredCardDescription.forEach((description) => {
                gsap.to(description, {
                    display: 'none',
                    opacity: 0,
                    duration: 0.1
                })
            })
        }

        const handler = () => {
            const data = Acards.find(c => c.key === card.getAttribute('data-key'))
            if (!data) return

            SelectedActions.forEach((action) => {
                if (action.type !== 'USE_ABILITY_CARD' && action.data !== undefined) {
                    action.data = undefined
                }
            })

            document.querySelectorAll('.selected-bakugan').forEach((bakugan) => {
                bakugan.classList.remove('selected-bakugan')
            })

            document.querySelectorAll('.selected-card').forEach((c) => {
                c.classList.remove('selected-card')
            })

            // cleanup(false, card)


            SelectAbilityCardForStandardTurn({
                card: card,
                cardsToUse: cardsToUse,
                data: data,
                useAbilityCard: useAbilityCard,
                userId: userId,
                scene: scene,
                bakugans: Abakugans
            })


            if (useAbilityCard.data !== undefined && useAbilityCard.data.key !== data.key) return

            let bakugan: THREE.Sprite<THREE.Object3DEventMap> | null = null
            const names = Abakugans.filter((bakugan) => bakugan.abilities.some((ability) => ability.key === useAbilityCard.data?.key)).map((bakugan) => `${bakugan.bakuganKey}-${userId}`)


            mouseMoveHandler = (event) => {
                bakugan = SelectBakuganOnMouseMove({
                    bakugan: bakugan,
                    camera: camera,
                    event: event,
                    scene: scene,
                    names: names
                })

            }

            clickHandler = () => {

                if (!useAbilityCard.data || bakugan === null) return
                if (!bakugan.userData.bakuganKey) return
                if (bakugan === null) return
                const slot = bakugan !== null ? Abakugans.find((b) => b.bakuganKey === bakugan?.userData.bakuganKey)?.slot : undefined
                if (!slot) return


                useAbilityCard.data.bakuganId = bakugan.userData.bakuganKey
                useAbilityCard.data.slot = slot


                bakugan.material.color.set('white')

                Abakugans.forEach((bakugan) => {
                    const mesh = scene.getObjectByName(`${bakugan.bakuganKey}-${userId}`) as THREE.Sprite<THREE.Object3DEventMap>
                    if (!mesh) return

                    if (mesh.material.opacity !== 1) {
                        mesh.material.opacity = 1
                    }
                })

                clearTurnInterface()

                socket.emit('use-ability-card', ({ roomId: roomId, abilityId: useAbilityCard.data.key, slot: useAbilityCard.data.slot, userId, bakuganKey: useAbilityCard.data.bakuganId }))

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

}