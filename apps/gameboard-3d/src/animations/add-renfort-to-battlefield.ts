import type { bakuganOnSlot } from '@bakugan-arena/game-data';
import gsap from 'gsap'
import type * as THREE from 'three'
import { getAttributColor } from '../functions/get-attrubut-color';
import { projectBakuganToScreen } from '../functions/project-to-screen';
import { PowerChangeNumberAnimation } from './power-change-animation';
import { CreateSpritePreviewContainer } from '../functions/create-bakugan-preview-container';

/**
 * A reinforcement joins the battle: its card springs from the bakugan on the
 * board, comes forward to be read, then fuses into the player's battle card.
 */
async function AddRenfortToBattleField({ bakugan, userId, scene }: {
    bakugan: bakuganOnSlot,
    userId: string,
    final_power: number,
    /** Needed to make the card start from the bakugan itself. */
    scene?: THREE.Scene
}): Promise<void> {

    return new Promise((resolve) => {
        const isLocal = bakugan.userId === userId
        const containerId = isLocal ? 'left-bakugan-previews-container' : 'right-bakugan-previews-container'
        const container = document.getElementById(containerId)

        if (!container) return resolve()

        const newCont = CreateSpritePreviewContainer({
            bakugan: bakugan,
            userId: userId
        })

        const newContainer = newCont.newContainer
        const sprite_container = newCont.sprite_container

        const containerPosition = container.getBoundingClientRect()
        newContainer.style.position = 'absolute'
        newContainer.style.top = containerPosition.top + 'px'
        newContainer.style.left = containerPosition.left + 'px'
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

        const globlal_sprite_container = document.getElementById(isLocal ? 'left-sprites-preview' : 'right-sprites-preview')
        const powerContainer = document.getElementById(`${bakugan.userId}-${bakugan.slot_id}`)

        if (!component || !globlal_sprite_container || !powerContainer) {
            newContainer.remove()
            overlay.remove()
            return resolve()
        }

        // Where the card comes from: the bakugan it represents, on the board.
        const origin = scene ? projectBakuganToScreen(scene, bakugan) : null
        const from = origin
            ? {
                x: origin.x - (containerPosition.left + containerPosition.width / 2),
                y: origin.y - (containerPosition.top + containerPosition.height / 2),
            }
            : { x: isLocal ? window.innerWidth / 3 : -window.innerWidth / 3, y: 0 }

        // Where it pauses to be read, just inside the board from its card.
        const presented = {
            x: isLocal ? containerPosition.width * 0.9 : -containerPosition.width * 0.9,
            y: -20,
        }

        const newPower = parseInt(powerContainer.textContent || '0') + bakugan.currentPower
        const timeline = gsap.timeline({
            onComplete: async () => {
                await PowerChangeNumberAnimation({
                    newPower: newPower,
                    slotId: bakugan.slot_id,
                    userId: bakugan.userId
                })
                resolve()
            }
        })

        // 1. From the bakugan to the reading spot, growing on the way.
        timeline.fromTo(component, {
            x: from.x,
            y: from.y,
            scale: 0.12,
            opacity: 0.35,
        }, {
            x: presented.x,
            y: presented.y,
            scale: 1,
            opacity: 1,
            duration: 0.6,
            ease: 'back.out(1.1)',
        })

        // 2. Then onto the battle card, where it fuses.
        timeline.to(component, {
            delay: 0.12,
            x: 0,
            y: 0,
            scale: 0.85,
            opacity: 0,
            duration: 0.35,
            ease: 'power2.in',
            onComplete: () => {
                component.remove()
            }
        })

        // 3. The battle card flashes as it takes the reinforcement in.
        timeline.fromTo(overlay, {
            background: 'none'
        }, {
            background: bakuganAttributColor,
            duration: 0.25,
            yoyo: true,
            repeat: 1,
            onStart: () => {
                globlal_sprite_container.appendChild(sprite_container)
            },
            onComplete: () => {
                overlay.remove()
            }
        }, '-=0.12')
    })

}

export {
    AddRenfortToBattleField
}
