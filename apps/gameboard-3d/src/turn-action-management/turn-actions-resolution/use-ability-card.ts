import type { ActionRequestAnswerType, ActionType } from '@bakugan-arena/game-data/src/type/actions-serveur-requests';
import * as THREE from 'three';
import { SelectAbilityCardForStandardTurn, SelectBakuganOnMouseMove } from '../turn-actions-function/select-slot';
import type { Socket } from 'socket.io-client';
import { clearTurnInterface } from './action-scope';
import gsap from 'gsap';

export function UseAbilityCard({ roomId, scene, SelectedActions, actions, userId, camera, socket }: {
    roomId: string,
    scene: THREE.Scene<THREE.Object3DEventMap>,
    SelectedActions: ActionRequestAnswerType,
    actions: ActionType[],
    userId: string,
    camera: THREE.PerspectiveCamera,
    socket: Socket
}) {

    const cardsToUse = document.querySelectorAll('.ability-card-selecter')


    const useAbilityCard = SelectedActions.find(a => a.type === 'USE_ABILITY_CARD')
    const onBoardBakugans = actions.find(a => a.type === 'USE_ABILITY_CARD')?.data
    const selectAbilityCard = actions.find(a => a.type === 'USE_ABILITY_CARD')

    if (!onBoardBakugans || !useAbilityCard || !selectAbilityCard) return
    if (!cardsToUse.length) return

    const bakugans = onBoardBakugans.map((bakugan) => bakugan)

    const cards = [...new Map(
        onBoardBakugans
            .flatMap(b => b.abilities)
            .map(card => [card.key, card])
    ).values()]

    const cardClickHandlers = new Map<Element, EventListener>()
    let mouseMoveHandler: ((e: MouseEvent) => void) | null = null
    let clickHandler: (() => void) | null = null
    let mouseEnter: (() => void) | null = null
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
        mouseMoveHandler = null
        clickHandler = null
        mouseEnter = null
        mouseLeave = null
    }

    cardsToUse.forEach(card => {

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
                    display: 'none',
                    opacity: 0,
                    duration: 0.1
                })
            })
        }

        const handler = () => {
            const data = cards.find(c => c.key === card.getAttribute('data-key'))
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

            cleanup(false, card)

            console.log(useAbilityCard);

            SelectAbilityCardForStandardTurn({
                card: card,
                cardsToUse: cardsToUse,
                data: data,
                useAbilityCard: useAbilityCard,
                userId: userId,
                scene: scene,
                bakugans: bakugans
            })

            console.log('SelectedActions after selecting ability card:', SelectedActions.find((a) => a.type === 'USE_ABILITY_CARD')?.data?.key);

            if (useAbilityCard.data !== undefined && useAbilityCard.data.key !== data.key) return

            let bakugan: THREE.Sprite<THREE.Object3DEventMap> | null = null
            const names = bakugans.filter((bakugan) => bakugan.abilities.some((ability) => ability.key === useAbilityCard.data?.key)).map((bakugan) => `${bakugan.bakuganKey}-${userId}`)
            console.log(names)


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
                const slot = bakugan !== null ? bakugans.find((b) => b.bakuganKey === bakugan?.userData.bakuganKey)?.slot : undefined
                console.log(slot)
                if (!slot) return

                console.log(useAbilityCard.data)

                useAbilityCard.data.bakuganId = bakugan.userData.bakuganKey
                useAbilityCard.data.slot = slot

                console.log(useAbilityCard.data)

                bakugan.material.color.set('white')

                bakugans.forEach((bakugan) => {
                    const mesh = scene.getObjectByName(`${bakugan.bakuganKey}-${userId}`) as THREE.Sprite<THREE.Object3DEventMap>
                    if (!mesh) return

                    if(mesh.material.opacity !== 1){
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

    return cleanup
}