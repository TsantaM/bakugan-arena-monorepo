import { Slots, type roomStateType, type turnCountSocketProps } from "@bakugan-arena/game-data"
import { EndGameMessage } from "../animations/show-message-animation"
import { createSprite } from "../meshes/bakugan.mesh"
import { createSlotMesh } from "../meshes/slot.mesh"
import { OnBattleStartFunctionAnimation } from "../scene-modifications-functions/on-battle-start-function-animation"
import { clearTurnInterface } from "../turn-action-management/turn-actions-resolution/action-scope"
import { setEliminatedCircles } from "./set-eliminated-circle"
import * as THREE from 'three'
import dayjs from "dayjs"
import duration from "dayjs/plugin/duration";
import relativeTime from "dayjs/plugin/relativeTime";

export function InitGameState({ state, plane, scene, userId, bakugansMeshs, gateCardMeshs }: {
    state: roomStateType, scene: THREE.Scene,
    userId: string,
    plane: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial, THREE.Object3DEventMap>,
    bakugansMeshs: THREE.Sprite<THREE.Object3DEventMap>[],
    gateCardMeshs: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshStandardMaterial, THREE.Object3DEventMap>[]
}) {
    const slots = state.portalSlots
    for (let i = 0; i < slots.length; i++) {
        const slot = slots[i]
        if (slot.portalCard !== null) {
            createSlotMesh({
                plane: plane,
                slot: slot,
                gateCardMeshs,
                userId
            })

            if (slot.bakugans.length > 0) {
                for (let b = 0; b < slot.bakugans.length; b++) {
                    const bakugan = slot.bakugans[b]
                    createSprite({
                        bakugan: bakugan,
                        scene: scene,
                        slot: slot,
                        slotIndex: Slots.indexOf(bakugan.slot_id),
                        userId: userId,
                        bakugansMeshs
                    })
                }
            }
        }

    }

    if (state.battleState.battleInProcess && !state.battleState.paused) {
        const slotOfBattle = state.portalSlots.find((s) => s.id === state.battleState.slot)
        if (!slotOfBattle) return
        OnBattleStartFunctionAnimation({
            slot: slotOfBattle,
            userId: userId
        })
    }

    setEliminatedCircles({
        count: state.eliminated.user,
        isLeft: true
    })

    setEliminatedCircles({
        count: state.eliminated.opponnent,
        isLeft: false
    })

    if (state.finished !== undefined) {
        clearTurnInterface()

        EndGameMessage({
            message: state.finished
        })

    }

    const turnState: turnCountSocketProps = {
        turnCount: state.turnState.turnCount,
        battleTurn: state.battleState.battleInProcess ? state.battleState.turns : undefined
    }
    const turnCounter = document.getElementById('turn-counter')
    if (!turnCounter) return

    const data = turnState.battleTurn !== undefined ? `${turnState.turnCount}T (${turnState.battleTurn})` : `${turnState.turnCount}T`
    turnCounter.textContent = data

    // INIT TIMERS
    state.timers.forEach((t) => {
        const { userId: user, timer } = t
        // console.log(`${user}: ${remaining}`)
        dayjs.extend(duration);
        dayjs.extend(relativeTime);
        const d = dayjs.duration(timer, 'seconds');
        const time = `${String(d.minutes()).padStart(2, "0")}:${String(d.seconds()).padStart(2, "0")}`;

        // console.log(`${user} : ${time}`)

        if (user === userId) {
            const timer = document.getElementById('left-timer')
            if (!timer) return
            timer.textContent = time
        } else {
            const timer = document.getElementById('right-timer')
            if (!timer) return
            timer.textContent = time
        }
    })

}