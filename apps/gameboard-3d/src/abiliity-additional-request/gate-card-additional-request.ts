import type { bakuganInDeck, gateCardActionRequestsType, resolutionGateCardType } from '@bakugan-arena/game-data'
import type { Socket } from 'socket.io-client'
import * as THREE from 'three'
import { BuildSelectAbilityCard } from '../turn-action-management/turn-action-builder/build-select-ability-card'
import { clearTurnInterface } from '../turn-action-management/turn-actions-resolution/action-scope'
import { BuildBakuganSelecterCards } from '../turn-action-management/turn-action-builder/build-select-bakugan'
import { removePreviousDialogBoxAnimation } from '../animations/show-message-animation'


export function GateCardAdditionalRequestResolution({ request, socket }: {
    request: gateCardActionRequestsType, plane: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial, THREE.Object3DEventMap>, camera: THREE.PerspectiveCamera, socket: Socket, scene: THREE.Scene<THREE.Object3DEventMap>
}) {

    if (request.data.type === 'TURN_ACTION_LAUNCHER') return

    if (request.data.type === 'SELECT_ABILITY_CARD') {
        BuildSelectAbilityCard({
            action: request.data
        })
        const SelectablesCards = request.data.data

        const cardsToSelect = document.querySelectorAll('.card-selecter');
        cardsToSelect.forEach(card => {
            card.addEventListener('click', () => {
                const data = SelectablesCards.find(c => c.key === card.getAttribute('data-key'));
                if (!data) return

                console.log('card' + data.name)

                const resolution: resolutionGateCardType = {
                    cardKey: request.cardKey,
                    roomId: request.roomId,
                    slot: request.slot,
                    userId: request.userId,
                    data: {
                        type: 'SELECT_ABILITY_CARD',
                        card: data,
                        cardOwnerId: request.data.target ? request.data.target : request.userId
                    }
                }

                socket.emit('gate-card-additional-request', resolution)

                clearTurnInterface()
            })
        })

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


                const resolution: resolutionGateCardType = {
                    cardKey: request.cardKey,
                    data: {
                        type: 'SELECT_BAKUGAN_TO_SET',
                        bakugan: bakugan
                    },
                    roomId: request.roomId,
                    slot: request.slot,
                    userId: request.userId
                }

                socket.emit('gate-card-additional-request', resolution)
                cleaner(bak)
                const additionalEffectsBox = document.getElementById('additional-effect-dialog-box')
                removePreviousDialogBoxAnimation(additionalEffectsBox)
            }

            bak.addEventListener('mousemove', mouseMove)
            bak.addEventListener('mouseleave', mouseLeave)
            window.addEventListener('click', clickHandler)
        })

    }

    if (request.data.skipable) {

        const turnActionContainer = document.createElement('div')
        turnActionContainer.classList.add('turn-interface')

        const button = document.createElement('button')
        button.id = 'next-turn-button'

        const img = document.createElement('img')
        img.src = 'next-turn-icon.png'
        img.alt = ''
        img.id = 'next-turn-button-icon'

        button.appendChild(img)

        document.body.appendChild(turnActionContainer)
        document.body.appendChild(button)

        let clickHandler: (() => void) | null = null

        const turnActionButton = document.getElementById('next-turn-button')
        if (!turnActionButton) return

        function cleanup() {
            if (clickHandler) {
                turnActionButton?.removeEventListener('click', clickHandler)
                clickHandler = null
            }
        }

        clickHandler = () => {
            const resolution: resolutionGateCardType = {
                cardKey: request.cardKey,
                roomId: request.roomId,
                slot: request.slot,
                userId: request.userId,
                data: {
                    type: 'SKIP_ACTION'
                }
            }

            socket.emit('gate-card-additional-request', resolution)

            clearTurnInterface()
            cleanup()
        }

        turnActionButton.addEventListener('click', clickHandler)


    }

}