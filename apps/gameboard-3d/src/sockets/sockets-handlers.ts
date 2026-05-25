import type {
    AbilityCardsActionsRequestsType, ActivePlayerActionRequestType, InactivePlayerActionRequestType, roomStateType, slots_id, turnCountSocketProps, Message,
    gateCardActionRequestsType,
} from "@bakugan-arena/game-data"
import { type AnimationDirectivesTypes } from "@bakugan-arena/game-data"
import * as THREE from "three"
import { TurnActionBuilder } from "../turn-action-management"
import type { Socket } from "socket.io-client"
import { OnBattleStartFunctionAnimation } from "../scene-modifications-functions/on-battle-start-function-animation"
import { AddRenfortToBattleAnimationFunction, SetBakuganAndAddRenfortAnimationAndFunction } from "../scene-modifications-functions/add-renfort-function-animation"
import { OnBattleEndAnimation } from "../animations/on-battle-end-animation"
import { RemoveGateCardFunctionAnimation } from "../scene-modifications-functions/remove-gate-card-function-animation"
import { ElimineBakuganFunctionAnimation, updateEliminatedUI } from "../scene-modifications-functions/elimine-bakugan-function-animation"
import { CancelGateCardAnimation } from "../animations/cancel-gate-card-animation"
import { ComeBackBakuganFunctionAnimation } from "../scene-modifications-functions/come-back-bakugan-function-animation"
import { OpenGateGateCardFunctionAnimation } from "../scene-modifications-functions/open-gate-card-function-animation"
import { MoveToAnotherSlotFunctionAnimation } from "../scene-modifications-functions/move-to-another-slot-function-animation"
import { SetBakuganFunctionAnimation } from "../scene-modifications-functions/set-bakugan-function-animation"
import { SetGateCardFunctionAndAnimation } from "../scene-modifications-functions/set-gate-card-function-animation"
import { PowerChangeAnimation, PowerChangeNumberAnimation } from "../animations/power-change-animation"
import { AdditionalRequestResolution } from "../abiliity-additional-request/additional-request-resolution"
import { AdditionalEffectMessage } from "../animations/show-message-animation"
import { clearTurnInterface } from "../turn-action-management/turn-actions-resolution/action-scope"
import { ActiveAbilityCardAnimation } from "../animations/active-ability-card"
import dayjs from "dayjs"
import duration from "dayjs/plugin/duration";
import relativeTime from "dayjs/plugin/relativeTime";
import { InitGameState } from "../functions/init-game-state"
import { RemoveRenforAnimation } from "../animations/remove-renfort-animation"
import { MoveGateCard } from "../animations/move-gate-card-animation"
import { SwipeGateCards } from "../animations/swipe-gate-cards"
import { CancelAbilityCardAnimation } from "../animations/cancel-ability-card-animation"
import { DragAndElimineAnimation } from "../animations/drag-and-elimine-animation"
import { ReviveBakuganAnimation } from "../animations/revive-animation"
import { sendMessageToParent } from "../functions/send-message-to-parent"
import { GateCardAdditionalRequestResolution } from "../abiliity-additional-request/gate-card-additional-request"

let animationQueue: AnimationDirectivesTypes[] = []
let isProcessingAnimations = false
let currentAnimationPromise: Promise<void> = Promise.resolve();


async function processAnimationQueue(
    userId: string,
    isSpectator: boolean,
    camera: THREE.PerspectiveCamera,
    scene: THREE.Scene,
    plane: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial, THREE.Object3DEventMap>,
    bakugansMeshs: THREE.Sprite<THREE.Object3DEventMap>[],
    gateCardMeshs: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshStandardMaterial, THREE.Object3DEventMap>[]
) {
    if (isProcessingAnimations) return currentAnimationPromise;

    isProcessingAnimations = true

    let i = 0;
    while (i < animationQueue.length) {

        const current = animationQueue[i];
        if (current.type === 'POWER_CHANGE') {

            const group: AnimationDirectivesTypes[] = [];

            while (i < animationQueue.length && animationQueue[i].type === 'POWER_CHANGE') {
                group.push(animationQueue[i]);
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

                if (anim.message) sendMessageToParent(anim.message)

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
                            newPower: current.data.finalPower ? current.data.finalPower : newPower
                        });
                    })();
                })
            );

            current.data.bakugan.forEach((b) => {
                const name = `${b.key}-${b.userId}`
                const mesh = scene.getObjectByName(name)
                if (!mesh) return
                mesh.userData.powerLevel = b.currentPower
            })

            continue;
        }

        // --------------------------
        // OTHERS ANIMATIONS TYPES
        // --------------------------

        if (current.type === 'SET_GATE_CARD') {

            sendMessageToParent(current.message)

            await SetGateCardFunctionAndAnimation({
                plane,
                slot: current.data.slot,
                userId: userId,
                gateCardMeshs,
                isSpectator
            });

        }

        if (current.type === 'SET_BAKUGAN') {

            sendMessageToParent(current.message)

            await SetBakuganFunctionAnimation({
                bakugan: current.data.bakugan,
                slot: current.data.slot,
                camera,
                scene,
                userId,
                bakugansMeshs
            });

        }

        if (current.type === 'MOVE_TO_ANOTHER_SLOT') {

            sendMessageToParent(current.message)

            await MoveToAnotherSlotFunctionAnimation({
                bakugan: current.data.bakugan,
                initialSlot: current.data.initialSlot,
                newSlot: current.data.newSlot,
                scene,
                userId
            });

        }

        if (current.type === 'OPEN_GATE_CARD') {

            sendMessageToParent(current.message)

            await OpenGateGateCardFunctionAnimation({
                plane,
                slot: current.data.slot,
                slotId: current.data.slotId
            });

        }

        if (current.type === 'CANCEL_GATE_CARD') {
            const mesh = plane.getObjectByName(current.data.slot.id)
            if (mesh) {

                sendMessageToParent(current.message)

                await CancelGateCardAnimation({
                    mesh: mesh as THREE.Mesh<THREE.PlaneGeometry, THREE.MeshStandardMaterial, THREE.Object3DEventMap>,
                    slot: current.data.slot
                });

            }
        }

        if (current.type === 'COME_BACK_BAKUGAN') {

            sendMessageToParent(current.message)

            await ComeBackBakuganFunctionAnimation({
                bakugan: current.data.bakugan,
                slot: current.data.slot,
                camera,
                scene,
                userId,
                bakugansMeshs
            });

        }

        if (current.type === 'ELIMINE_BAKUGAN') {

            sendMessageToParent(current.message)

            await ElimineBakuganFunctionAnimation({
                bakugan: current.data.bakugan,
                scene,
                slot: current.data.slot,
                userId,
                bakugansMeshs
            });

        }

        if (current.type === 'REMOVE_GATE_CARD') {

            sendMessageToParent(current.message)

            await RemoveGateCardFunctionAnimation({
                plane,
                slot: current.data.slot,
                camera,
                scene,
                userId,
                gateCardMeshs,
                bakugansMeshs
            });

        }

        if (current.type === 'BATTLE_START') {

            sendMessageToParent(current.message)

            await OnBattleStartFunctionAnimation({
                slot: current.data.slot,
                userId: userId
            })

        }

        if (current.type === 'BATTLE-END') {
            sendMessageToParent(current.message)

            await OnBattleEndAnimation()
        }

        if (current.type === 'SET_BAKUGAN_AND_ADD_RENFORT') {

            sendMessageToParent(current.message)

            await SetBakuganAndAddRenfortAnimationAndFunction({
                bakugan: current.data.bakugan,
                camera: camera,
                scene: scene,
                slot: current.data.slot,
                userId: userId,
                bakugansMeshs
            })

        }

        if (current.type === 'ADD_RENFORT') {

            sendMessageToParent(current.message)

            await AddRenfortToBattleAnimationFunction({
                bakugan: current.data.bakugan,
                userId: userId
            })

        }

        if (current.type === 'ACTIVE_ABILITY_CARD') {
            sendMessageToParent(current.message)
            await ActiveAbilityCardAnimation(current.data.card, current.data.attribut)
        }

        if (current.type === 'ABILITY_CARD_FAILED') {

            sendMessageToParent(current.message)

        }

        if (current.type === 'REMOVE_RENFORT') {

            sendMessageToParent(current.message)

            await RemoveRenforAnimation({
                bakugan: current.data.bakugan,
                userId: userId,
            })

        }

        if (current.type === 'MOVE_GATE_CARD') {

            sendMessageToParent(current.message)

            await MoveGateCard({
                newSlot: current.data.newSlot,
                slot: current.data.slot,
                plane: plane,
                scene: scene,
                userId: userId
            })

        }

        if (current.type === 'SWIPE_GATE_CARD') {
            sendMessageToParent(current.message)

            await SwipeGateCards({
                plane: plane,
                scene: scene,
                slot1: current.data.slot1,
                slot2: current.data.slot2,
                userId: userId
            })

        }

        if (current.type === 'CANCEL_ABILITY_CARD') {

            sendMessageToParent(current.message)

            await CancelAbilityCardAnimation(
                current.data.card,
                current.data.attribut
            )

        }

        if (current.type === 'DRAG_AND_ELIMINE') {

            sendMessageToParent(current.message)

            await DragAndElimineAnimation({
                bakugan: current.data.bakugan,
                cardUser: current.data.cardUser,
                bakugansMeshs: bakugansMeshs,
                scene,
            })

            updateEliminatedUI({
                bakuganUserId: current.data.bakugan.userId,
                currentUserId: userId
            })

        }

        if (current.type === 'REVIVE_BAKUGAN') {

            sendMessageToParent(current.message)

            await ReviveBakuganAnimation({
                bakuganKey: current.data.bakuganKey,
                bakuganUserId: current.data.bakuganUserId,
                camera: camera,
                scene: scene,
                userId: userId
            })

        }

        if (current.type === 'ADDITIONAL_MESSAGE') {
            sendMessageToParent(current.message)
        }

        if (current.type === 'ACTIVE_PROTECTION') {
            sendMessageToParent(current.message)
        }

        if (current.type === 'REMOVE_PROTECTION') {
            sendMessageToParent(current.message)
        }

        i++; // avancer à l'animation suivante
    }

    animationQueue = []
    isProcessingAnimations = false
}

export function registerSocketHandlers(
    socket: Socket,
    ctx: {
        userId: string
        roomId: string
        camera: THREE.PerspectiveCamera
        scene: THREE.Scene
        plane: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial, THREE.Object3DEventMap>
        light: THREE.AmbientLight,
        bakugansMeshs: THREE.Sprite<THREE.Object3DEventMap>[],
        gateCardMeshs: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshStandardMaterial, THREE.Object3DEventMap>[],
    }
) {
    const { camera, plane, roomId, scene, userId, light, bakugansMeshs, gateCardMeshs } = ctx

    socket.off() // 💣 purge TOTALE des anciens listeners

    socket.on("init-room-state", (state: roomStateType) => {
        // 👉 ton code existant ici (sans socket.on)

        plane.clear()
        scene.clear()
        scene.add(plane)
        scene.add(light)
        scene.add(camera)

        const texture = new THREE.TextureLoader().load('./images/cards/empty-gate-slot.jpg')

        texture.wrapS = THREE.RepeatWrapping
        texture.wrapT = THREE.RepeatWrapping

        const planeSize = 500

        texture.repeat.set(
            planeSize / 4,
            planeSize / 6
        )

        // ajustement fin pour alignement parfait
        texture.offset.set(
            0,
            0
        )

        const color = new THREE.Color(0x226D80)

        const bgPlane = new THREE.Mesh(
            new THREE.PlaneGeometry(planeSize, planeSize),
            new THREE.MeshBasicMaterial({
                map: texture,
                side: THREE.DoubleSide
            })
        )

        bgPlane.rotation.x = -Math.PI / 2
        bgPlane.position.y = -0.01
        bgPlane.position.z = 2
        bgPlane.position.x = 4
        bgPlane.material.color = color
        // bgPlane.material.transparent = true
        // bgPlane.material.opacity = 0.75

        scene.add(bgPlane)

        document.getElementById('left-bakugan-previews-container')?.remove()
        document.getElementById('right-bakugan-previews-container')?.remove()

        camera.position.set(3, 5, 8)
        InitGameState({ state: state, bakugansMeshs, isSpectator: false, gateCardMeshs, plane, scene, userId })

    })

    socket.on("turn-action-request", async (request: ActivePlayerActionRequestType | InactivePlayerActionRequestType) => {

        // attendre que les animations en cours soient terminées
        await currentAnimationPromise;

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

    socket.on("animations", (animations: AnimationDirectivesTypes[]) => {
        // console.log(animations.map((a) => a.type))
        animationQueue.push(...animations)
        if (!isProcessingAnimations) {
            currentAnimationPromise = processAnimationQueue(
                userId, false, camera, scene, plane, bakugansMeshs, gateCardMeshs
            )
        }
    })

    socket.on("ability-additional-request", async (request: AbilityCardsActionsRequestsType) => {
        if (!request.data.target && request.userId !== userId) return
        if (request.data.target && request.data.target !== userId) return


        await currentAnimationPromise;

        clearTurnInterface()
        AdditionalRequestResolution({
            request: request, camera: camera, plane: plane, socket: socket, scene: scene
        })

        AdditionalEffectMessage({
            message: request.data.message
        })

    })

    socket.on('gate-card-additional-request', async (request: gateCardActionRequestsType) => {

        // alert('request gate card' + request.data.type)
        if (!request.data.target && request.userId !== userId) return
        if (request.data.target && request.data.target !== userId) return
        if (request.data.type === 'TURN_ACTION_LAUNCHER') return

        await currentAnimationPromise;
        clearTurnInterface()

        GateCardAdditionalRequestResolution({
            request: request, camera: camera, plane: plane, socket: socket, scene: scene
        })

        AdditionalEffectMessage({
            message: request.data.message
        })

    })

    socket.on('turn-count-updater', (turnState: turnCountSocketProps) => {
        const turnCounter = document.getElementById('turn-counter')
        if (!turnCounter) return

        const data = turnState.battleTurn !== undefined ? `${turnState.turnCount}T (${turnState.battleTurn})` : `${turnState.turnCount}T`
        turnCounter.textContent = data

    })

    socket.on('player-timer', (timer: { userId: string, remaining: number }) => {
        const { userId: user, remaining } = timer
        // console.log(`${user}: ${remaining}`)
        dayjs.extend(duration);
        dayjs.extend(relativeTime);
        const d = dayjs.duration(remaining, 'seconds');
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

    socket.on('game-finished', (message: Message) => {
        clearTurnInterface()
        sendMessageToParent([message])
    })

}

export function registerSocketHandlersViewers(socket: Socket,
    ctx: {
        player1: string
        roomId: string
        camera: THREE.PerspectiveCamera
        scene: THREE.Scene
        plane: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial, THREE.Object3DEventMap>
        light: THREE.AmbientLight,
        bakugansMeshs: THREE.Sprite<THREE.Object3DEventMap>[],
        gateCardMeshs: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshStandardMaterial, THREE.Object3DEventMap>[]
    }) {

    const { camera, plane, scene, light, bakugansMeshs, gateCardMeshs, player1 } = ctx

    socket.off() // 💣 purge TOTALE des anciens listeners

    socket.on("init-room-state", (state: roomStateType) => {
        // 👉 ton code existant ici (sans socket.on)

        const texture = new THREE.TextureLoader().load('/images/cards/empty-gate-slot.jpg', () => console.log('texture chargée'), undefined, (err) => console.log(err))

        texture.wrapS = THREE.RepeatWrapping
        texture.wrapT = THREE.RepeatWrapping

        const planeSize = 500

        texture.repeat.set(
            planeSize / 4,
            planeSize / 6
        )

        // ajustement fin pour alignement parfait
        texture.offset.set(
            0,
            0
        )

        const color = new THREE.Color(0x226D80)

        const bgPlane = new THREE.Mesh(
            new THREE.PlaneGeometry(planeSize, planeSize),
            new THREE.MeshBasicMaterial({
                map: texture,
                side: THREE.DoubleSide
            })
        )

        bgPlane.rotation.x = -Math.PI / 2
        bgPlane.position.y = -0.01
        bgPlane.position.z = 2
        bgPlane.position.x = 4
        bgPlane.material.color = color
        // bgPlane.material.transparent = true
        // bgPlane.material.opacity = 0.75

        plane.clear()
        scene.clear()
        scene.add(bgPlane)
        scene.add(plane)
        scene.add(light)
        scene.add(camera)

        document.getElementById('left-bakugan-previews-container')?.remove()
        document.getElementById('right-bakugan-previews-container')?.remove()

        camera.position.set(3, 5, 8)
        InitGameState({ state: state, bakugansMeshs, gateCardMeshs, plane, scene, userId: player1, isSpectator: true })

        console.log(texture)
    })

    socket.on("animations", (animations: AnimationDirectivesTypes[]) => {
        animationQueue.push(...animations)
        currentAnimationPromise = processAnimationQueue(player1, true, camera, scene, plane, bakugansMeshs, gateCardMeshs)
    })

    socket.on('player-timer', (timer: { userId: string, remaining: number }) => {
        const { userId: user, remaining } = timer
        // console.log(`${user}: ${remaining}`)
        dayjs.extend(duration);
        dayjs.extend(relativeTime);
        const d = dayjs.duration(remaining, 'seconds');
        const time = `${String(d.minutes()).padStart(2, "0")}:${String(d.seconds()).padStart(2, "0")}`;

        // console.log(`${user} : ${time}`)

        if (user === player1) {
            const timer = document.getElementById('left-timer')
            if (!timer) return
            timer.textContent = time
        } else {
            const timer = document.getElementById('right-timer')
            if (!timer) return
            timer.textContent = time
        }

    })

    socket.on('turn-count-updater', (turnState: turnCountSocketProps) => {
        const turnCounter = document.getElementById('turn-counter')
        if (!turnCounter) return

        const data = turnState.battleTurn !== undefined ? `${turnState.turnCount}T (${turnState.battleTurn})` : `${turnState.turnCount}T`
        turnCounter.textContent = data

    })

    socket.on('game-finished', (message: Message) => {
        clearTurnInterface()
        sendMessageToParent([message])
    })
    
}