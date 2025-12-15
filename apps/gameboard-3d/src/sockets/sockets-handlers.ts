import type {
    ActivePlayerActionRequestType,
    InactivePlayerActionRequestType
} from "@bakugan-arena/game-data/src/type/actions-serveur-requests"
import { Slots, type AnimationDirectivesTypes } from "@bakugan-arena/game-data"
import type * as THREE from "three"
import { TurnActionBuilder } from "../turn-action-management"
import type { Socket } from "socket.io-client"
import { createSlotMesh } from "../meshes/slot.mesh"
import { createSprite } from "../meshes/bakugan.mesh"
import { OnBattleStartFunctionAnimation } from "../scene-modifications-functions/on-battle-start-function-animation"
import type { roomStateType, slots_id } from "@bakugan-arena/game-data/src/type/room-types"
import { SetBakuganAndAddRenfortAnimationAndFunction } from "../scene-modifications-functions/add-renfort-function-animation"
import { OnBattleEndAnimation } from "../animations/on-battle-end-animation"
import { RemoveGateCardFunctionAnimation } from "../scene-modifications-functions/remove-gate-card-function-animation"
import { ElimineBakuganFunctionAnimation } from "../scene-modifications-functions/elimine-bakugan-function-animation"
import { CancelGateCardAnimation } from "../animations/cancel-gate-card-animation"
import { ComeBackBakuganFunctionAnimation } from "../scene-modifications-functions/come-back-bakugan-function-animation"
import { OpenGateGateCardFunctionAnimation } from "../scene-modifications-functions/open-gate-card-function-animation"
import { MoveToAnotherSlotFunctionAnimation } from "../scene-modifications-functions/move-to-another-slot-function-animation"
import { SetBakuganFunctionAnimation } from "../scene-modifications-functions/set-bakugan-function-animation"
import { SetGateCardFunctionAndAnimation } from "../scene-modifications-functions/set-gate-card-function-animation"
import { PowerChangeAnimation, PowerChangeNumberAnimation } from "../animations/power-change-animation"

export function registerSocketHandlers(
    socket: Socket,
    ctx: {
        userId: string
        roomId: string
        camera: THREE.PerspectiveCamera
        scene: THREE.Scene
        plane: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial, THREE.Object3DEventMap>
        light: THREE.AmbientLight
    }
) {
    const { camera, plane, roomId, scene, userId, light } = ctx

    socket.off() // 💣 purge TOTALE des anciens listeners

    socket.on("init-room-state", (state: roomStateType) => {
        console.log("ROOM INIT")
        // 👉 ton code existant ici (sans socket.on)

        plane.clear()
        scene.clear()
        scene.add(plane)
        scene.add(light)
        scene.add(camera)

        document.getElementById('left-bakugan-previews-container')?.remove()
        document.getElementById('right-bakugan-previews-container')?.remove()

        camera.position.set(3, 5, 8)
        const slots = state.portalSlots
        for (let i = 0; i < slots.length; i++) {
            const slot = slots[i]
            if (slot.portalCard !== null) {
                createSlotMesh({
                    plane: plane,
                    slot: slot
                })

                if (slot.bakugans.length > 0) {
                    for (let b = 0; b < slot.bakugans.length; b++) {
                        const bakugan = slot.bakugans[b]
                        createSprite({
                            bakugan: bakugan,
                            scene: scene,
                            slot: slot,
                            slotIndex: Slots.indexOf(bakugan.slot_id),
                            userId: userId
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
    })

    socket.on("turn-action-request",
        (request: ActivePlayerActionRequestType | InactivePlayerActionRequestType) => {
            console.log('actions', request.actions)
            TurnActionBuilder({
                request,
                userId: userId,
                camera: camera,
                scene: scene,
                plane: plane,
                roomId: roomId,
                socket: socket
            })
        }
    )

    socket.on("animations", async (animations: AnimationDirectivesTypes[]) => {
        let i = 0;
        while (i < animations.length) {

            const current = animations[i];
            if (current.type === 'POWER_CHANGE') {

                const group: AnimationDirectivesTypes[] = [];

                while (i < animations.length && animations[i].type === 'POWER_CHANGE') {
                    group.push(animations[i]);
                    i++;
                }

                await Promise.all(
                    group.map(anim => {
                        if (anim.type !== 'POWER_CHANGE') return
                        return Promise.all(
                            anim.data.bakugan.map(b =>
                                PowerChangeAnimation({
                                    bakugan: b,
                                    camera: camera,
                                    powerChange: anim.data.powerChange,
                                    scene: scene,
                                    malus: anim.data.malus
                                })
                            )
                        );
                    })


                );

                const combinedPowerChanges = new Map<string, number>();

                for (const anim of group) {
                    if (anim.type !== 'POWER_CHANGE') return
                    for (const b of anim.data.bakugan) {
                        const key = `${b.userId}-${b.slot_id}`;
                        const old = combinedPowerChanges.get(key) || 0;
                        const delta = anim.data.malus ? -anim.data.powerChange : anim.data.powerChange;
                        combinedPowerChanges.set(key, old + delta);
                    }
                }

                await Promise.all(
                    Array.from(combinedPowerChanges.entries()).map(([key, totalChange]) => {
                        return (async () => {
                            const [userId, slot, number] = key.split("-");
                            const slotId = `${slot}-${number}`;
                            const powerContainer = document.getElementById(key);
                            if (!powerContainer) return;

                            const oldPower = parseInt(powerContainer.textContent || "0");
                            const newPower = oldPower + totalChange;

                            await PowerChangeNumberAnimation({
                                userId,
                                slotId: slotId as slots_id,
                                newPower
                            });
                        })();
                    })
                );

                continue;
            }

            // --------------------------
            // OTHERS ANIMATIONS TYPES
            // --------------------------

            if (current.type === 'SET_GATE_CARD') {
                await SetGateCardFunctionAndAnimation({
                    plane,
                    slot: current.data.slot
                });
            }

            if (current.type === 'SET_BAKUGAN') {
                await SetBakuganFunctionAnimation({
                    bakugan: current.data.bakugan,
                    slot: current.data.slot,
                    camera,
                    scene,
                    userId
                });
            }

            if (current.type === 'MOVE_TO_ANOTHER_SLOT') {
                await MoveToAnotherSlotFunctionAnimation({
                    bakugan: current.data.bakugan,
                    initialSlot: current.data.initialSlot,
                    newSlot: current.data.newSlot,
                    scene,
                    userId
                });
            }

            if (current.type === 'OPEN_GATE_CARD') {
                await OpenGateGateCardFunctionAnimation({
                    plane,
                    slot: current.data.slot,
                    slotId: current.data.slotId
                });
            }

            if (current.type === 'CANCEL_GATE_CARD') {
                const mesh = plane.getObjectByName(current.data.slot.id)
                if (mesh) {
                    await CancelGateCardAnimation({
                        mesh: mesh as THREE.Mesh<THREE.PlaneGeometry, THREE.MeshStandardMaterial, THREE.Object3DEventMap>,
                        slot: current.data.slot
                    });
                }
            }

            if (current.type === 'COME_BACK_BAKUGAN') {
                await ComeBackBakuganFunctionAnimation({
                    bakugan: current.data.bakugan,
                    slot: current.data.slot,
                    camera,
                    scene,
                    userId
                });
            }

            if (current.type === 'ELIMINE_BAKUGAN') {
                await ElimineBakuganFunctionAnimation({
                    bakugan: current.data.bakugan,
                    scene,
                    slot: current.data.slot,
                    userId
                });
            }

            if (current.type === 'REMOVE_GATE_CARD') {
                await RemoveGateCardFunctionAnimation({
                    plane,
                    slot: current.data.slot,
                    camera,
                    scene,
                    userId
                });
            }

            if (current.type === 'BATTLE_START') {
                await OnBattleStartFunctionAnimation({
                    slot: current.data.slot,
                    userId: userId
                })
            }

            if (current.type === 'BATTLE-END') {
                await OnBattleEndAnimation()
            }

            if (current.type === 'SET_BAKUGAN_AND_ADD_RENFORT') {
                await SetBakuganAndAddRenfortAnimationAndFunction({
                    bakugan: current.data.bakugan,
                    camera: camera,
                    scene: scene,
                    slot: current.data.slot,
                    userId: userId
                })
            }

            i++; // avancer à l'animation suivante
        }
    })
}
