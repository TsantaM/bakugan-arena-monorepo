import type { portalSlotsTypeElement } from "@bakugan-arena/game-data";
import { CreateBakuganPreviewContainer } from "../functions/create-bakugan-preview-container";
import { BakuganPreviewOnBattleStartAnimation } from "../animations/bakugan-preview-battle-start";

async function OnBattleStartFunctionAnimation({ slot, userId }: { slot: portalSlotsTypeElement, userId: string }) {
    const left_data_container = document.getElementById('left-data-container')
    const right_data_container = document.getElementById('right-data-container')
    const bakugans = slot.bakugans

    bakugans.forEach((bakugan) => {
        const container = CreateBakuganPreviewContainer({
            bakugan: bakugan,
            userId: userId
        })

        if (bakugan.userId === userId) {
            if (left_data_container) {

                let totalPower: number = 0

                bakugans.forEach((bakugan) => {
                    if (bakugan.userId === userId) {
                        totalPower += bakugan.currentPower
                    }
                })
                left_data_container.appendChild(container)
                const powerContainer = document.getElementById(`${userId}-${slot.id}`)
                if (powerContainer && parseInt(powerContainer.textContent) !== totalPower) {
                    powerContainer.innerHTML = totalPower.toString()
                } else {
                    return
                }
            }
        } else {
            if (right_data_container) {
                right_data_container.appendChild(container)
            }
        }

        BakuganPreviewOnBattleStartAnimation(container.id)

    })



}

export {
    OnBattleStartFunctionAnimation
}