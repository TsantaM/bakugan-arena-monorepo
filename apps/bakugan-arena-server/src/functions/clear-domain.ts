import { ComeBackBakuganDirectiveAnimation, stateType } from "@bakugan-arena/game-data";

export function ClearDomain(roomData: stateType, userId: string) {
    if (!roomData) return

    const setableBakugans = roomData.decksState.map((deck) => deck.bakugans).flat().filter((deck) => !deck?.bakuganData.elimined && !deck?.bakuganData.onDomain).map((bakugan) => bakugan?.bakuganData.key).filter((b) => b !== undefined)

    const decks = roomData.decksState

    const slots = roomData.protalSlots

    const battleState = roomData.battleState

    if (setableBakugans.length > 0) return
    if (battleState.battleInProcess) return

    slots.forEach((slot) => {

        slot.bakugans.forEach((bakugan, index) => {

            const deck = decks.find((d) => d.userId === bakugan.userId)
            if(!deck) return
            const bakugansIndex = deck.bakugans.findIndex((b) => b?.bakuganData.key === bakugan.key)
            if(bakugansIndex !== -1) {
                if(!deck.bakugans[bakugansIndex]?.bakuganData) return
                deck.bakugans[bakugansIndex].bakuganData.onDomain = false
            }

            ComeBackBakuganDirectiveAnimation({
                animations: roomData.animations,
                bakugan: bakugan,
                slot: slot
            })

            slot.bakugans.splice(index, 1)
        })

    })

}