import type { portalSlotsTypeElement } from "@bakugan-arena/game-data";
import { CreateBakuganPreviewContainer } from "../functions/create-bakugan-preview-container";
import { AddRenfortToBattleField } from "../animations/add-renfort-to-battlefield";

async function OnBattleStartFunctionAnimation({ slot, userId }: { slot: portalSlotsTypeElement, userId: string }) {

    document.getElementById('left-bakugan-previews-container')?.remove()
    document.getElementById('right-bakugan-previews-container')?.remove()

    const left_data_container = document.getElementById('left-data-container')
    const right_data_container = document.getElementById('right-data-container')
    const bakugans = slot.bakugans

    const userBakugan = bakugans.filter((b) => b.userId === userId)
    const container = CreateBakuganPreviewContainer({
        bakugan: userBakugan[0],
        userId: userId
    })
    left_data_container?.appendChild(container)

    const opponentsBakugan = bakugans.filter((b) => b.userId !== userId)
    const opponentContainer = CreateBakuganPreviewContainer({
        bakugan: opponentsBakugan[0],
        userId: userId
    })
    right_data_container?.appendChild(opponentContainer)

    bakugans.splice(bakugans.indexOf(userBakugan[0]), 1)
    bakugans.splice(bakugans.indexOf(opponentsBakugan[0]), 1)

    // await BakuganPreviewOnBattleStartAnimation(container.id)
    // await BakuganPreviewOnBattleStartAnimation(opponentContainer.id)

    bakugans.forEach((bakugan) => {

        const powerContainer = document.getElementById(`${bakugan.userId}-${bakugan.slot_id}`)

        if (!powerContainer) return
        const final_power = parseInt(powerContainer.innerHTML) + bakugan.currentPower

        AddRenfortToBattleField({
            bakugan: bakugan,
            userId: userId,
            final_power: final_power
        })

    })

}

export {
    OnBattleStartFunctionAnimation
}