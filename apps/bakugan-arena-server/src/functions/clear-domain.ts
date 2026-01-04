import { ComeBackBakuganDirectiveAnimation, stateType, updateDeckBakugans } from "@bakugan-arena/game-data";

export function ClearDomain(roomData: stateType, userId: string) {
    if (!roomData) return

    const setableBakugans = roomData.decksState.map((deck) => deck.bakugans).flat().filter((deck) => !deck?.bakuganData.elimined && !deck?.bakuganData.onDomain).map((bakugan) => bakugan?.bakuganData.key).filter((b) => b !== undefined)

    const decks = roomData.decksState

    const slots = roomData.protalSlots

    const battleState = roomData.battleState

    if (setableBakugans.length > 0) return
    if (battleState.battleInProcess) return

    decks.forEach((d) => {
        updateDeckBakugans({
            deck: d,
            keys: setableBakugans,
            eliminate: false
        })
    })

    slots.forEach((slot) => {
        slot.bakugans.forEach((bakugan) => {
            ComeBackBakuganDirectiveAnimation({
                animations: roomData.animations,
                bakugan: bakugan,
                slot: slot
            })
        })
    })

}