import type { bakuganOnSlot } from "@bakugan-arena/game-data";
import gsap from "gsap";
import { PowerChangeNumberAnimation } from "./power-change-animation";
import { getAttributColor } from "../functions/get-attrubut-color";

export function RemoveRenforAnimation({ bakugan, userId }: { bakugan: bakuganOnSlot, userId: string, final_power?: number }) {
    const containerId = bakugan.userId === userId ? 'left-bakugan-previews-container' : 'right-bakugan-previews-container'
    const container = document.getElementById(containerId)
    const bakuganAttributColor = getAttributColor(bakugan.attribut)


    if (container) {
        const overlay = document.createElement('div')
        overlay.classList.add('container-overlay')
        overlay.id = `${container.id}-overlay`
        container.appendChild(overlay)

        const powerContainer = document.getElementById(`${bakugan.userId}-${bakugan.slot_id}`)
        if (!powerContainer) return
        const newPower = parseInt(powerContainer.textContent) - bakugan.currentPower
        const spritesContainer = document.querySelectorAll('.sprite-container')
        const DataKey = `${bakugan.key}-${bakugan.userId}-${bakugan.slot_id}`


        const Sprite = [...spritesContainer].some((container) => container.getAttribute('data-key') === DataKey)
        if(!Sprite) return

        const timeline = gsap.timeline()
        timeline.fromTo(overlay, {
            background: 'none'
        }, {
            background: bakuganAttributColor,
            duration: 0.5,
            onComplete: () => {
                spritesContainer.forEach((sprite) => {
                    if (sprite.getAttribute('data-key') === DataKey) {
                        sprite.remove()
                    }
                })
            }
        })

        timeline.fromTo(overlay, {
            background: bakuganAttributColor,
            opacity: 1
        }, {
            opacity: 0,
            duration: 0.5,
            onComplete: () => {
                overlay.remove()
                PowerChangeNumberAnimation({
                    newPower: newPower,
                    slotId: bakugan.slot_id,
                    userId: bakugan.userId
                })
            }
        },)
    }


}