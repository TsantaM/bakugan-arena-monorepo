import { Server, Socket } from "socket.io/dist";
import { Battle_Brawlers_Game_State } from "../game-state/battle-brawlers-game-state";
import { CheckBattle, CheckGameFinished, GateCardsList } from "@bakugan-arena/game-data";

export const socketTurn = (io: Server, socket: Socket) => {

    socket.on('turn-action', ({ roomId, userId }: { roomId: string, userId: string }) => {
        const roomData = Battle_Brawlers_Game_State.find((room) => room?.roomId === roomId)
        const roomIndex = Battle_Brawlers_Game_State.findIndex((room) => room?.roomId === roomId)


        if (roomData && roomData.turnState.previous_turn != userId) {
            console.log(roomData.roomId, roomIndex)
            // Add turn counter
            const turnCount = roomData.turnState.turnCount + 1

            // Update player turn
            const players = roomData.decksState.map((d) => d.userId)
            const newUserTurn = players.find((p) => p != roomData.turnState.turn)

            const turn = newUserTurn ? roomData.turnState.turn = newUserTurn : roomData.turnState.turn

            if (!Battle_Brawlers_Game_State[roomIndex]) return

            Battle_Brawlers_Game_State[roomIndex].turnState.turnCount = turnCount
            Battle_Brawlers_Game_State[roomIndex].turnState.turn = turn

            if (Battle_Brawlers_Game_State[roomIndex].turnState.turnCount === 2) {
                Battle_Brawlers_Game_State[roomIndex].protalSlots[4].can_set = true
                Battle_Brawlers_Game_State[roomIndex].turnState.set_new_bakugan = false

            } else if (Battle_Brawlers_Game_State[roomIndex].turnState.turnCount > 2) {
                Battle_Brawlers_Game_State[roomIndex].turnState.set_new_bakugan = true
                Battle_Brawlers_Game_State[roomIndex].turnState.use_ability_card = true
                Battle_Brawlers_Game_State[roomIndex].protalSlots.forEach(p => {
                    if (p.can_set === false && p.portalCard === null) {
                        p.can_set = true
                    }
                })

            } else {
                Battle_Brawlers_Game_State[roomIndex].turnState.set_new_bakugan = true
                Battle_Brawlers_Game_State[roomIndex].turnState.use_ability_card = true
                Battle_Brawlers_Game_State[roomIndex].protalSlots.forEach(p => {
                    if (p.can_set === false && p.portalCard === null) {
                        p.can_set = true
                    }
                })
            }

            if (Battle_Brawlers_Game_State[roomIndex].battleState.battleInProcess === true && !Battle_Brawlers_Game_State[roomIndex].battleState.paused) {

                if (Battle_Brawlers_Game_State[roomIndex].battleState.turns > 0) {
                    Battle_Brawlers_Game_State[roomIndex].battleState.turns -= 1
                }
            }

            if (Battle_Brawlers_Game_State[roomIndex].battleState.battleInProcess === false) {
                CheckBattle({ roomState: Battle_Brawlers_Game_State[roomIndex] })
            }

            CheckGameFinished({ roomId, roomState: roomData })
            roomData.protalSlots.filter((s) => s.portalCard !== null && !s.state.open && !s.state.blocked).forEach((s) => {
                const bakuganKey = s.bakugans.find((b) => b.userId === s.portalCard?.userId)?.key
                const userId = s.portalCard?.userId
                const gateKey = s.portalCard?.key
                if(gateKey) {
                    const gate = GateCardsList.find((c) => c.key === gateKey)
                    if(gate) {
                        const activable = gate.autoActivationCheck ? gate.autoActivationCheck({portalSlot: s, roomState: roomData}) : false
                        if(activable ) {
                            gate.onOpen({roomState: roomData, slot: s.id, bakuganKey: bakuganKey, userId: userId })
                        }
                    }
                }
            })

            const state = Battle_Brawlers_Game_State[roomIndex]

            io.to(roomId).emit('turn-action', state)

        }

    })

}