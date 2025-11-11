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
import { PowerChangeAnimation } from './animations/power-change-animation'
import { io } from 'socket.io-client'
import type { roomStateType } from '@bakugan-arena/game-data/src/type/room-types'

const canvas = document.getElementById('gameboard-canvas')
const params = new URLSearchParams(window.location.search)
const roomId = params.get('roomId')
const userId = params.get('userId')
const socket = io("http://localhost:3005")

socket.emit('init-room-state', ({ roomId }))


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

    scene.add(plane)
    scene.add(light)
    scene.add(camera)

    // INIT Room
    socket.on('init-room-state', (state: roomStateType) => {
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
    })

    socket.on('animations', async (animations: AnimationDirectivesTypes[]) => {
      let animationsTable: AnimationDirectivesTypes[] = [...animations];

      for (const anim of animationsTable) {

        if (anim.type === 'SET_GATE_CARD') {
          await SetGateCardFunctionAndAnimation({
            plane: plane,
            slot: anim.data.slot
          });
        }

        if (anim.type === 'SET_BAKUGAN') {
          await SetBakuganFunctionAnimation({
            bakugan: anim.data.bakugan,
            slot: anim.data.slot,
            camera: camera,
            scene: scene,
            userId: userId
          });
        }

        if (anim.type === 'OPEN_GATE_CARD') {
          await OpenGateGateCardFunctionAnimation({
            plane: plane,
            slot: anim.data.slot,
            slotId: anim.data.slotId
          });
        }

        if (anim.type === 'POWER_CHANGE') {
          // Si tu veux que chaque animation de PowerChange soit aussi séquentielle
          for (const b of anim.data.bakugan) {
            await PowerChangeAnimation({
              bakugan: b,
              camera: camera,
              powerChange: anim.data.powerChange,
              scene: scene,
              malus: anim.data.malus
            });
          }
        }

      }
    });


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

