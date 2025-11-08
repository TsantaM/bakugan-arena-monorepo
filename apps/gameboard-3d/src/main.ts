import { OrbitControls } from 'three/examples/jsm/Addons.js'
import './style.css'
import * as THREE from 'three'
import { PlaneMesh } from './meshes/plane.mesh'
import { Slots, type bakuganOnSlot, type portalSlotsType, type portalSlotsTypeElement, type slots_id } from '@bakugan-arena/game-data'
import { createSlotMesh } from './meshes/slot.mesh'
import { SetGateCardFunctionAndAnimation } from './scene-modifications-functions/set-gate-card-function-animation'
import { MoveCamera } from './animations/camera-move-animation'
import { CancelGateCardAnimation } from './animations/cancel-gate-card-animation'
import { OpenGateGateCardFunctionAnimation } from './scene-modifications-functions/open-gate-card-function-animation'
import { SetBakuganFunctionAnimation } from './scene-modifications-functions/set-bakugan-function-animation'
import { createSprite } from './meshes/bakugan.mesh'
import { MoveToAnotherSlotFunctionAnimation } from './scene-modifications-functions/move-to-another-slot-function-animation'
import { ComeBackBakuganFunctionAnimation } from './scene-modifications-functions/come-back-bakugan-function-animation'
import { RemoveGateCardFunctionAnimation } from './scene-modifications-functions/remove-gate-card-function-animation'
import { ElimineBakuganFunctionAnimation } from './scene-modifications-functions/elimine-bakugan-function-animation'
import { PowerChangeAnimation } from './animations/power-change-animation'

const canvas = document.getElementById('gameboard-canvas')

const userId: string = 'user-1'

let slots: portalSlotsType = [
  {
    id: 'slot-1',
    bakugans: [],
    activateAbilities: [],
    can_set: true,
    portalCard: null,
    state: {
      blocked: false,
      canceled: false,
      open: false
    }
  },
  {
    id: 'slot-2',
    bakugans: [
      {
        slot_id: 'slot-2',
        id: 1,
        key: 'laserman-darkus',
        userId: 'user-2',
        powerLevel: 250,
        currentPower: 250,
        attribut: 'Darkus',
        image: 'laserman',
        abilityBlock: false,
        assist: false,
        family: 'laserman'
      }
    ],
    activateAbilities: [],
    can_set: true,
    portalCard: {
      key: 'reacteur-pyrus',
      userId: 'user-1'
    },
    state: {
      blocked: false,
      canceled: false,
      open: false
    }
  },
  {
    id: 'slot-3',
    bakugans: [],
    activateAbilities: [],
    can_set: true,
    portalCard: null,
    state: {
      blocked: false,
      canceled: false,
      open: false
    }

  },
  {
    id: 'slot-4',
    bakugans: [],
    activateAbilities: [],
    can_set: true,
    portalCard: null,
    state: {
      blocked: false,
      canceled: false,
      open: false
    }
  },
  {
    id: 'slot-5',
    bakugans: [{
      slot_id: 'slot-5',
      id: 1,
      key: 'mantris-pyrus',
      userId: 'user-1',
      powerLevel: 250,
      currentPower: 250,
      attribut: 'Pyrus',
      image: 'mantris',
      abilityBlock: false,
      assist: false,
      family: 'mantris'

    },
    {
      slot_id: 'slot-5',
      id: 1,
      key: 'tuskor-haos',
      userId: 'user-2',
      powerLevel: 250,
      currentPower: 250,
      attribut: 'Haos',
      image: 'tuskor',
      abilityBlock: false,
      assist: false,
      family: 'tuskor'

    }],
    activateAbilities: [],
    can_set: true,
    portalCard: {
      key: 'reacteur-haos',
      userId: 'user-2'
    },
    state: {
      blocked: false,
      canceled: false,
      open: false
    }
  }, {
    id: 'slot-6',
    bakugans: [],
    activateAbilities: [],
    can_set: true,
    portalCard: null,
    state: {
      blocked: false,
      canceled: false,
      open: false
    }
  }
]

const gateCardSetButton = document.getElementById('set-gate-card')
const openGateCard = document.getElementById("open-gate-card")
const cancelGateCard = document.getElementById('cancel-gate-card')
const removeGateCard = document.getElementById('remove-gate-card')
const resetCamera = document.getElementById('reset-camera')

const setBakugan = document.getElementById("set-bakugan")
const powerChange = document.getElementById("power-change")
const moveBakugan = document.getElementById('move-bakugan')
const comeBack = document.getElementById('come-back-bakugan')
const elimineBakugan = document.getElementById('eliminate-bakugan')

const focusSlot = document.getElementById('focus')
focusSlot?.addEventListener('click', () => alert('Not Working now ! Try Later !'))


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


  // Init field state

  for (let i = 0; i < slots.length; i++) {
    const slot = slots[i];
    if (slot.portalCard !== null) {
      createSlotMesh({
        plane: plane,
        slot: slot
      })

      if (slot.bakugans.length > 0) {
        for (let i = 0; i < slot.bakugans.length; i++) {
          const bakugan = slot.bakugans[i]
          createSprite({
            bakugan: bakugan,
            scene: scene,
            slot: slot,
            slotIndex: Slots.indexOf(slot.id),
            userId: userId
          })
        }
      }

    }
  }

  gateCardSetButton?.addEventListener('click', () => {

    const slot: portalSlotsTypeElement = {
      id: 'slot-1',
      bakugans: [],
      activateAbilities: [],
      can_set: true,
      portalCard: {
        key: 'reacteur-haos',
        userId: 'user-1'
      },
      state: {
        blocked: false,
        canceled: false,
        open: false
      }
    }

    slots[Slots.indexOf(slot.id)] = slot

    SetGateCardFunctionAndAnimation({ plane: plane, slot: slot })
  })

  openGateCard?.addEventListener('click', () => {
    const id: slots_id = 'slot-2'
    if (!slots[Slots.indexOf(id)].state.open && !slots[Slots.indexOf(id)].state.canceled && !slots[Slots.indexOf(id)].state.blocked) {
      OpenGateGateCardFunctionAnimation({
        plane: plane,
        slot: slots[Slots.indexOf(id)],
        slotId: id
      })

    }
    slots[Slots.indexOf(id)].state.open = true
  })

  cancelGateCard?.addEventListener('click', () => {
    const id: slots_id = 'slot-2'
    const mesh = plane.getObjectByName(id)
    if (!mesh) return
    CancelGateCardAnimation({
      mesh: mesh as THREE.Mesh<THREE.PlaneGeometry, THREE.MeshStandardMaterial, THREE.Object3DEventMap>,
      slot: slots[Slots.indexOf(id)]
    })
    slots[Slots.indexOf(id)].state.canceled = true
  })

  removeGateCard?.addEventListener('click', () => {
    const id: slots_id = 'slot-5'
    RemoveGateCardFunctionAnimation({
      plane: plane,
      scene: scene,
      slot: slots[Slots.indexOf(id)],
      userId: userId,
      camera: camera
    })
  })

  setBakugan?.addEventListener('click', () => {

    const bakugan: bakuganOnSlot = {
      id: slots[Slots.indexOf('slot-2')].bakugans.length + 1,
      key: 'fourtress-pyrus',
      abilityBlock: false,
      assist: false,
      attribut: 'Pyrus',
      currentPower: 360,
      family: 'fourtress',
      image: 'fourtress',
      powerLevel: 360,
      slot_id: 'slot-2',
      userId: 'user-1'

    }

    const bakugan2: bakuganOnSlot = {
      id: slots[Slots.indexOf('slot-2')].bakugans.length + 1,
      key: 'tigrerra-haos',
      abilityBlock: false,
      assist: false,
      attribut: 'Haos',
      currentPower: 360,
      family: 'tigrerra',
      image: 'tigrerra',
      powerLevel: 360,
      slot_id: 'slot-2',
      userId: 'user-2'

    }

    const slot = slots[Slots.indexOf(bakugan.slot_id)]
    const slot2 = slots[Slots.indexOf(bakugan2.slot_id)]
    slot.bakugans.push(bakugan)
    slot2.bakugans.push(bakugan2)
    SetBakuganFunctionAnimation({
      bakugan: bakugan,
      camera: camera,
      scene: scene,
      slot: slot,
      userId: userId
    })

    SetBakuganFunctionAnimation({
      bakugan: bakugan2,
      camera: camera,
      scene: scene,
      slot: slot2,
      userId: userId
    })

  })

  powerChange?.addEventListener('click', () => {
    PowerChangeAnimation({
      scene: scene,
      bakugan: slots[Slots.indexOf('slot-2')].bakugans[0],
      powerChange: 100,
      malus: true,
      camera: camera
    })
  })

  comeBack?.addEventListener('click', () => {

    const slot = slots[Slots.indexOf('slot-5')]
    slot.bakugans.forEach((b) => {
      ComeBackBakuganFunctionAnimation({
        bakugan: b,
        camera: camera,
        scene: scene,
        slot: slot,
        userId: userId
      })
    })
  })

  moveBakugan?.addEventListener('click', () => {
    const bakugan: bakuganOnSlot = {
      id: slots[Slots.indexOf('slot-2')].bakugans.length + 1,
      key: 'tigrerra-haos',
      abilityBlock: false,
      assist: false,
      attribut: 'Haos',
      currentPower: 360,
      family: 'tigrerra',
      image: 'tigrerra',
      powerLevel: 360,
      slot_id: 'slot-2',
      userId: 'user-2'
    }

    const initialSlot = slots[Slots.indexOf(bakugan.slot_id)]
    initialSlot.bakugans.splice(initialSlot.bakugans.indexOf(bakugan), 1)
    console.log(initialSlot)
    const newSlot = slots[Slots.indexOf('slot-5')]

    console.log('can run animation')
    newSlot.bakugans.push(bakugan)

    MoveToAnotherSlotFunctionAnimation({
      bakugan: bakugan,
      initialSlot: initialSlot,
      newSlot: newSlot,
      scene: scene,
      userId: userId
    })

    bakugan.slot_id = 'slot-5'
    bakugan.id = newSlot.bakugans.length + 1
    newSlot.bakugans[newSlot.bakugans.indexOf(bakugan)].slot_id = bakugan.slot_id
    newSlot.bakugans[newSlot.bakugans.indexOf(bakugan)].id = bakugan.id

  })

  elimineBakugan?.addEventListener('click', () => {
    const slot = slots[Slots.indexOf('slot-2')]
    const bakugan = slot.bakugans[0]
    console.log(slot)

    ElimineBakuganFunctionAnimation({
      bakugan: bakugan,
      scene: scene,
      slot: slot,
      userId: userId,
    })

    slot.bakugans.splice(slot.bakugans.indexOf(bakugan), 1)

  })

  resetCamera?.addEventListener('click', () => {
    MoveCamera({ camera: camera, newPosition: new THREE.Vector3(3, 5, 8) })
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