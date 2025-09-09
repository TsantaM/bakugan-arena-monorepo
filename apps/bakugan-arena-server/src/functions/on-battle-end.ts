import { Battle_Brawlers_Game_State } from "../game-state/battle-brawlers-game-state"

export const onBattleEnd = ({ roomId }: { roomId: string }) => {
    const roomData = Battle_Brawlers_Game_State.find((room) => room?.roomId === roomId)
    const roomIndex = Battle_Brawlers_Game_State.findIndex((room) => room?.roomId === roomId)

    if (roomData && Battle_Brawlers_Game_State[roomIndex]) {
        const battleState = roomData.battleState

        if (battleState.battleInProcess === true && !battleState.paused) {
            if (battleState.turns === 0) {
                const player1Bakugans = roomData.protalSlots.find((s) => s.id === battleState.slot)?.bakugans.filter((b) => b.userId === roomData.players[0].userId)
                const player2Bakugans = roomData.protalSlots.find((s) => s.id === battleState.slot)?.bakugans.filter((b) => b.userId !== roomData.players[0].userId)



                if (player1Bakugans && player2Bakugans) {
                    const player1Total = player1Bakugans.reduce((acc, bakugan) => acc + bakugan.currentPower, 0)
                    const player1 = {
                        userId: roomData.players[0].userId,
                        player1Total
                    }
                    const player2Total = player2Bakugans.reduce((acc, bakugan) => acc + bakugan.currentPower, 0)
                    const player2 = {
                        userId: roomData.players[1].userId,
                        player2Total
                    }

                    const keys = [...player1Bakugans.map((b) => b.key), ...player2Bakugans.map((b) => b.key)]
                    const loser = player1.player1Total < player2.player2Total ? player1.userId : player2.userId
                    const deckToUpdate = Battle_Brawlers_Game_State[roomIndex].decksState.find((d) => d.userId === loser)
                    const player1Deck = Battle_Brawlers_Game_State[roomIndex].decksState.find((d) => d.userId === player1.userId)
                    const player2Deck = Battle_Brawlers_Game_State[roomIndex].decksState.find((d) => d.userId === player2.userId)


                    if (deckToUpdate && deckToUpdate.bakugans && deckToUpdate.bakugans !== null && player1Deck && player2Deck) {
                        deckToUpdate.bakugans.filter((b) => keys.includes(b?.bakuganData.key ? b?.bakuganData.key : '')).forEach((b) => {
                            if (b && b.bakuganData) {
                                b.bakuganData.onDomain = false
                                b.bakuganData.elimined = true
                            }
                        })
                        player1Deck.bakugans.filter((b) => keys.includes(b?.bakuganData.key ? b?.bakuganData.key : '')).forEach((b) => {
                            if (b && b.bakuganData) {
                                b.bakuganData.onDomain = false
                            }
                        })
                        player2Deck.bakugans.filter((b) => keys.includes(b?.bakuganData.key ? b?.bakuganData.key : '')).forEach((b) => {
                            if (b && b.bakuganData) {
                                b.bakuganData.onDomain = false
                            }
                        })
                    }

                    const slotToUpdate = roomData.protalSlots.find((s) => s.id === battleState.slot)
                    if (slotToUpdate) {
                        slotToUpdate.portalCard = null
                        slotToUpdate.bakugans = []
                        slotToUpdate.can_set = true
                        slotToUpdate.state.open = false,
                            slotToUpdate.state.canceled = false
                    }

                    battleState.battleInProcess = false
                    battleState.slot = null
                    battleState.turns = 2,
                        battleState.paused = false
                    roomData.turnState.set_new_gate = true
                    roomData.turnState.set_new_bakugan = true

                }
            }
        } else {
            return
        }
    }
}