import type { bakuganOnSlot } from '@bakugan-arena/game-data';
import gsap from 'gsap'
import { getAttributColor } from '../functions/get-attrubut-color';
import { PowerChangeNumberAnimation } from './power-change-animation';
import { CreateSpritePreviewContainer } from '../functions/create-bakugan-preview-container';

function AddRenfortToBattleField({ bakugan, userId }: { bakugan: bakuganOnSlot, userId: string, final_power: number }) {
    const containerId = bakugan.userId === userId ? 'left-bakugan-previews-container' : 'right-bakugan-previews-container'
    const container = document.getElementById(containerId)

    const {newContainer, sprite_container} = CreateSpritePreviewContainer({
        bakugan: bakugan,
        userId: userId
    })

    if (container) {
        const containerPosition = container.getBoundingClientRect()
        newContainer.style.position = 'absolute'
        newContainer.style.top = containerPosition.top + 'px'
        newContainer.style.bottom = containerPosition.bottom + 'px'
        newContainer.style.left = containerPosition.left + 'px'
        newContainer.style.right = containerPosition.right + 'px'
        newContainer.style.width = containerPosition.width + 'px'
        newContainer.style.height = containerPosition.height + 'px'
        newContainer.style.zIndex = '1'

        document.body.appendChild(newContainer)

        const overlay = document.createElement('div')
        overlay.classList.add('container-overlay')
        overlay.id = `${container.id}-overlay`
        container.appendChild(overlay)

        const component = document.getElementById(newContainer.id)
        const bakuganAttributColor = getAttributColor(bakugan.attribut)

        const globlal_sprite_container = document.getElementById(bakugan.userId === userId ? 'left-sprites-preview' : 'right-sprites-preview')
        const powerContainer = document.getElementById(`${bakugan.userId}-${bakugan.slot_id}`)

        if (component && globlal_sprite_container && powerContainer) {

            const newPower = parseInt(powerContainer.textContent) + bakugan.currentPower
            console.log(newPower)
            const timeline = gsap.timeline()
            timeline.fromTo(component, {
                x: bakugan.userId === userId ? window.innerWidth / 2 : -window.innerWidth / 2,
                scale: 0
            }, {
                x: bakugan.userId === userId ? window.innerWidth / 4 : -window.innerWidth / 4,
                y: -20,
                scale: 1
            })
            timeline.to(component, {
                delay: 0.15,
                x: bakugan.userId === userId ? containerPosition.left : containerPosition.left - containerPosition.right + containerPosition.width,
                y: 0,
                opacity: 0,
                onComplete: () => {
                    component.remove()
                }
            })
            timeline.fromTo(overlay, {
                background: 'none'
            }, {
                background: bakuganAttributColor,
                yoyo: true,
                repeat: 1,
                onStart: () => {
                    globlal_sprite_container.appendChild(sprite_container)

                },
                onComplete: () => {
                    overlay.remove()

                    // Fonction pour le changement de puissance

                    PowerChangeNumberAnimation({
                        newPower: newPower,
                        slotId: bakugan.slot_id,
                        userId: bakugan.userId
                    })
                }
            })
        }

    }


}

export {
    AddRenfortToBattleField
}