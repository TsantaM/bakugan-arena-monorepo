import { OrbitControls } from 'three/examples/jsm/Addons.js'
import './style.css'
import * as THREE from 'three'
import { PlaneMesh } from './meshes/plane.mesh'
import { Slots, type MessageToIframe } from '@bakugan-arena/game-data'
import { createSlotMesh } from './meshes/slot.mesh'
import { createSprite } from './meshes/bakugan.mesh'

const canvas = document.getElementById('gameboard-canvas')

let userId: string


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

  // Listen INIT_GAME_ROOM message
  console.log('bonsoir')


  window.addEventListener('message', (event: MessageEvent<MessageToIframe>) => {
    if (event.data.type === 'INIT_GAME_ROOM') {
      const slots = event.data.data.slots
      userId = event.data.data.userId

      console.log(slots)

      for (let i = 0; i < slots.length; i++) {
        const slot = slots[i]
        console.log(slot)
        if (slot.portalCard !== null) {
          console.log('used')
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

    }

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