import type { ActionRequestAnswerType, ActionType } from '@bakugan-arena/game-data/src/type/actions-serveur-requests';
import * as THREE from 'three';
import { SelectAbilityCardForStandardTurn, SelectBakuganOnMouseMove } from '../turn-actions-function/select-slot';
import type { Socket } from 'socket.io-client';
import { clearTurnInterface } from './action-scope';

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
    const onBoardBakugans = actions.find(a => a.type === 'USE_ABILITY_CARD')?.data.onBoardBakugans
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

    cardsToUse.forEach(card => {
        const handler = () => {
            const data = cards.find(c => c.key === card.getAttribute('data-key'))
            if (!data) return

            cleanup(false)

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

                clearTurnInterface()

                socket.emit('use-ability-card', ({ roomId: roomId, abilityId: useAbilityCard.data.key, slot: useAbilityCard.data.slot, userId, bakuganKey: useAbilityCard.data.key }))

                cleanup(true)

            }

            window.addEventListener('mousemove', mouseMoveHandler)
            window.addEventListener('click', clickHandler)
        }

        card.addEventListener('click', handler)
        cardClickHandlers.set(card, handler)
    })

    return cleanup
}