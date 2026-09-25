import type { bakuganOnSlot } from "@bakugan-arena/game-data";
import gsap from "gsap";
import { PowerChangeNumberAnimation } from "./power-change-animation";
import { getAttributColor } from "../functions/get-attrubut-color";
import { CreateSpritePreviewContainer } from "../functions/create-bakugan-preview-container";

/**
 * A reinforcement leaves the battle: the battle card flashes, the reinforcement
 * card is pulled back out of it, then shrinks away.
 *
 * The mirror of `AddRenfortToBattleField`.
 */
export async function RemoveRenforAnimation({ bakugan, userId }: { bakugan: bakuganOnSlot, userId: string, final_power?: number }): Promise<void> {

    return new Promise((resolve) => {

        const isLocal = bakugan.userId === userId
        const containerId = isLocal ? 'left-bakugan-previews-container' : 'right-bakugan-previews-container'
        const container = document.getElementById(containerId)
        const bakuganAttributColor = getAttributColor(bakugan.attribut)

        if (!container) return resolve()

        const overlay = document.createElement('div')
        overlay.classList.add('container-overlay')
        overlay.id = `${container.id}-overlay`
        container.appendChild(overlay)

        const powerContainer = document.getElementById(`${bakugan.userId}-${bakugan.slot_id}`)
        if (!powerContainer) {
            overlay.remove()
            return resolve()
        }
        const newPower = parseInt(powerContainer.textContent || '0') - bakugan.currentPower
        const spritesContainer = document.querySelectorAll('.sprite-container')
        const DataKey = `${bakugan.key}-${bakugan.userId}-${bakugan.slot_id}`

        const Sprite = [...spritesContainer].some((container) => container.getAttribute('data-key') === DataKey)
        if (!Sprite) {
            overlay.remove()
            return resolve()
        }

        // The card that is pulled back out of the battle card.
        const containerPosition = container.getBoundingClientRect()
        const { newContainer } = CreateSpritePreviewContainer({ bakugan, userId })
        newContainer.id = `${newContainer.id}-extracted`
        newContainer.style.position = 'absolute'
        newContainer.style.top = containerPosition.top + 'px'
        newContainer.style.left = containerPosition.left + 'px'
        newContainer.style.width = containerPosition.width + 'px'
        newContainer.style.height = containerPosition.height + 'px'
        newContainer.style.zIndex = '1'
        newContainer.style.opacity = '0'
        document.body.appendChild(newContainer)

        const extracted = { x: isLocal ? containerPosition.width * 0.9 : -containerPosition.width * 0.9, y: -20 }

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

        // 1. The battle card flashes and gives the reinforcement up.
        timeline.fromTo(overlay, {
            background: 'none'
        }, {
            background: bakuganAttributColor,
            duration: 0.3,
            onComplete: () => {
                spritesContainer.forEach((sprite) => {
                    if (sprite.getAttribute('data-key') === DataKey) {
                        sprite.remove()
                    }
                })
            }
        })

        // 2. The card is pulled out of it, at full size.
        timeline.fromTo(newContainer, {
            x: 0,
            y: 0,
            scale: 0.85,
            opacity: 0,
        }, {
            x: extracted.x,
            y: extracted.y,
            scale: 1,
            opacity: 1,
            duration: 0.35,
            ease: 'back.out(1.1)',
        }, '-=0.1')

        timeline.fromTo(overlay, {
            background: bakuganAttributColor,
            opacity: 1
        }, {
            opacity: 0,
            duration: 0.35,
            onComplete: () => {
                overlay.remove()
            }
        }, '<')

        // 3. Then it shrinks away.
        timeline.to(newContainer, {
            delay: 0.1,
            scale: 0.1,
            opacity: 0,
            y: extracted.y + 30,
            duration: 0.3,
            ease: 'power2.in',
            onComplete: () => {
                newContainer.remove()
            }
        })
    })

}
