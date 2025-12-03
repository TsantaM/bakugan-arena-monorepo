import { OrbitControls } from 'three/examples/jsm/Addons.js'
import './style.css'
import * as THREE from 'three'
import { PlaneMesh } from './meshes/plane.mesh'
import { Slots, type AnimationDirectivesTypes } from '@bakugan-arena/game-data'
import { createSlotMesh } from './meshes/slot.mesh'
import { createSprite } from './meshes/bakugan.mesh'
import { SetGateCardFunctionAndAnimation } from './scene-modifications-functions/set-gate-card-function-animation'
import { SetBakuganFunctionAnimation } from './scene-modifications-functions/set-bakugan-function-animation'
import { OpenGateGateCardFunctionAnimation } from './scene-modifications-functions/open-gate-card-function-animation'
import { PowerChangeAnimation, PowerChangeNumberAnimation } from './animations/power-change-animation'
import { io } from 'socket.io-client'
import type { roomStateType, slots_id } from '@bakugan-arena/game-data/src/type/room-types'
import { ComeBackBakuganFunctionAnimation } from './scene-modifications-functions/come-back-bakugan-function-animation'
import { ElimineBakuganFunctionAnimation } from './scene-modifications-functions/elimine-bakugan-function-animation'
import { RemoveGateCardFunctionAnimation } from './scene-modifications-functions/remove-gate-card-function-animation'
import { CancelGateCardAnimation } from './animations/cancel-gate-card-animation'
import { MoveToAnotherSlotFunctionAnimation } from './scene-modifications-functions/move-to-another-slot-function-animation'
import { OnBattleStartFunctionAnimation } from './scene-modifications-functions/on-battle-start-function-animation'
import type { ActivePlayerActionRequestType, InactivePlayerActionRequestType } from '@bakugan-arena/game-data/src/type/actions-serveur-requests'
import { TurnActionBuilder } from './turn-action-management'

const canvas = document.getElementById('gameboard-canvas')
const params = new URLSearchParams(window.location.search)
const roomId = params.get('roomId')
const userId = params.get('userId')
const userImage = params.get('userImage')
const opponentImage = params.get('opponentImage')
const socket = io("http://localhost:3005")
const reload = document.getElementById("init-room")

if (userImage) {
  const left_profile_picture = document.getElementById('left-profile-picture-img')
  if (left_profile_picture) left_profile_picture.setAttribute('src', userImage)
}

if (opponentImage) {
  const right_profile_picture = document.getElementById('right-profile-picture-img')
  if (right_profile_picture) right_profile_picture.setAttribute('src', opponentImage)
}


socket.emit('init-room-state', ({ roomId, userId }))
socket.on('turn-action-request', (request: ActivePlayerActionRequestType | InactivePlayerActionRequestType) => {
  console.log(request)

  const actions = [request.actions.mustDo, request.actions.mustDoOne, request.actions.optional].flat();
  console.log(actions)

  TurnActionBuilder({
    actions: actions
  })
})
reload?.addEventListener('click', () => {
  socket.emit('init-room-state', ({ roomId, userId }))
  socket.on('turn-action-request', (request: ActivePlayerActionRequestType | InactivePlayerActionRequestType) => {
    console.log(request)

    const actions = [request.actions.mustDo, request.actions.mustDoOne, request.actions.optional].flat();
    console.log(actions)

    TurnActionBuilder({
      actions: actions
    })
  })
})

if (roomId !== null && userId !== null) {
  if (canvas) {
    const scene = new THREE.Scene()
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(window.devicePixelRatio)
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100)
    const controls = new OrbitControls(camera, renderer.domElement)
    const light = new THREE.AmbientLight('white', 3)
    const plane = PlaneMesh.clone()
    plane.material.transparent = true
    camera.position.set(3, 5, 8)
    plane.rotateX(-Math.PI / 2)

    // Key press
    window.addEventListener('keydown', (e) => {
      const zoomSpeed = 0.5

      if (e.key === '+' || e.key === '=') {
        camera.position.z -= zoomSpeed
      } else if (e.key === '-' || e.key === '_') {
        camera.position.z += zoomSpeed
      } else if (e.key === 'ArrowUp') {
        camera.position.y += zoomSpeed
      } else if (e.key === 'ArrowDown') {
        camera.position.y -= zoomSpeed
      } else if (e.key === 'ArrowLeft') {
        camera.position.x -= zoomSpeed
      } else if (e.key === 'ArrowRight') {
        camera.position.x += zoomSpeed
      }

    })

    // INIT Room
    socket.on('init-room-state', (state: roomStateType) => {
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

    socket.on('animations', async (animations: AnimationDirectivesTypes[]) => {
      console.log(animations)
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

        i++; // avancer à l'animation suivante
      }
    });

    socket.on('turn-action-request', (request: ActivePlayerActionRequestType | InactivePlayerActionRequestType) => {
      console.log(request)

      const actions = [request.actions.mustDo, request.actions.mustDoOne, request.actions.optional].flat();
      console.log(actions)

      TurnActionBuilder({
        actions: actions
      })
    })

    scene.add(plane)
    scene.add(light)
    scene.add(camera)


    loop()
    function loop() {
      requestAnimationFrame(loop)
      controls.update()
      renderer.render(scene, camera)
    }

    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    })

  }
}


