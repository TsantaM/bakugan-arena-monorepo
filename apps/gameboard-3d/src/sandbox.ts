import { OrbitControls } from 'three/examples/jsm/Addons.js'
import './style.css'
import * as THREE from 'three'
import { PlaneMesh } from './meshes/plane.mesh'
import {
  createEmptySandboxSnapshot,
  replaySnapshotToRoomState,
  SANDBOX_USER_ID,
  type ActivePlayerActionRequestType,
  type AnimationDirectivesTypes,
  type replaySnapshotType,
} from '@bakugan-arena/game-data'
import { InitGameState } from './functions/init-game-state'
import { applyReplaySnapshotUi } from './functions/apply-replay-snapshot-ui'
import { TurnActionInterfaceBuilder } from './turn-action-management/turn-interface-builder'
import { clearTurnInterface } from './turn-action-management/turn-actions-resolution/action-scope'
import { hideTooltip, initTooltip, showTooltip, tooltip } from './functions/tooltips-functions'
import { initGameboardLocaleFromUrl } from './i18n/locale'
import { playAnimation } from './sockets/sockets-handlers'
import { CUSTOM_ANIMATION_KEYS } from './animations/custom-animations/registry'
import gsap from 'gsap'
import { buildBakuganTooltipContent, buildSlotTooltipContent } from './functions/mesh-tooltip-content'
import type { SpriteUserData } from './meshes/bakugan.mesh'
import type { SlotMeshUsersData } from './meshes/slot.mesh'

initGameboardLocaleFromUrl()

type SandboxPayload = {
  snapshot: replaySnapshotType
  perspectiveUserId?: string
  actionRequest?: ActivePlayerActionRequestType | null
  /** Played after the board is applied (Animation Lab). */
  animationsToPlay?: AnimationDirectivesTypes[]
}

const canvas = document.getElementById('gameboard-canvas')
const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100)
const plane = PlaneMesh.clone()
plane.material.transparent = true
camera.position.set(3, 5, 8)
plane.rotateX(-Math.PI / 2)

const bakugansMeshs: THREE.Sprite<THREE.Object3DEventMap>[] = []
const gateCardMeshs: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshStandardMaterial, THREE.Object3DEventMap>[] = []
const keepObjects: THREE.Object3D[] = []

let renderer: THREE.WebGLRenderer | null = null
let controls: OrbitControls | null = null
let ready = false
let perspectiveUserId = SANDBOX_USER_ID
let playingAnimations = false

function clearActiveAbilityOverlays() {
  document.querySelectorAll('.active-ability-image').forEach((element) => {
    gsap.killTweensOf(element)
    element.querySelectorAll('.overlay, .overlay2, .active-ability-image-img').forEach((child) => {
      gsap.killTweensOf(child)
    })
    element.remove()
  })
}

function applySandboxBoardState({
  snapshot,
  perspectiveUserId: nextPerspectiveUserId,
  actionRequest,
}: {
  snapshot: replaySnapshotType
  perspectiveUserId: string
  actionRequest?: ActivePlayerActionRequestType | null
}) {
  perspectiveUserId = nextPerspectiveUserId
  const keep = new Set(keepObjects)

  ;[...scene.children].forEach((child) => {
    if (!keep.has(child)) scene.remove(child)
  })

  plane.clear()
  bakugansMeshs.length = 0
  gateCardMeshs.length = 0

  document.getElementById('left-bakugan-previews-container')?.remove()
  document.getElementById('right-bakugan-previews-container')?.remove()
  clearActiveAbilityOverlays()
  clearTurnInterface()
  hideTooltip()

  applyReplaySnapshotUi(snapshot, perspectiveUserId)
  InitGameState({
    state: replaySnapshotToRoomState(snapshot),
    bakugansMeshs,
    gateCardMeshs,
    plane,
    scene,
    userId: perspectiveUserId,
    isSpectator: false,
  })

  if (actionRequest) {
    TurnActionInterfaceBuilder({ request: actionRequest })
  }
}

async function playSandboxAnimations(animations: AnimationDirectivesTypes[]) {
  if (!ready || playingAnimations || animations.length === 0) return

  playingAnimations = true
  try {
    await playAnimation(
      perspectiveUserId,
      false,
      camera,
      scene,
      plane,
      bakugansMeshs,
      gateCardMeshs,
      animations,
    )
  } finally {
    playingAnimations = false
  }
}

function initScene() {
  if (!canvas || !(canvas instanceof HTMLCanvasElement)) return

  renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(window.devicePixelRatio)

  controls = new OrbitControls(camera, renderer.domElement)
  controls.mouseButtons = {
    LEFT: THREE.MOUSE.PAN,
    MIDDLE: THREE.MOUSE.DOLLY,
    RIGHT: THREE.MOUSE.ROTATE,
  }
  controls.touches = {
    ONE: THREE.TOUCH.PAN,
    TWO: THREE.TOUCH.DOLLY_ROTATE,
  }

  const light = new THREE.AmbientLight('white', 3)
  const texture = new THREE.TextureLoader().load('./images/cards/empty-gate-slot.jpg')
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  const planeSize = 500
  texture.repeat.set(planeSize / 4, planeSize / 6)

  const bgPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(planeSize, planeSize),
    new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.DoubleSide,
      color: new THREE.Color(0x226d80),
    }),
  )
  bgPlane.rotation.x = -Math.PI / 2
  bgPlane.position.set(4, -0.01, 2)

  scene.background = new THREE.Color(0x808080)
  scene.add(bgPlane)
  scene.add(plane)
  scene.add(light)
  scene.add(camera)

  keepObjects.push(bgPlane, plane, light, camera)

  const raycaster = new THREE.Raycaster()
  const mouse = new THREE.Vector2()
  let hoveredMesh: THREE.Sprite<THREE.Object3DEventMap> | null = null
  let hoveredSlot: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshStandardMaterial, THREE.Object3DEventMap> | null = null

  initTooltip()

  window.addEventListener('mousemove', (event: MouseEvent) => {
    const elementUnderMouse = document.elementFromPoint(event.clientX, event.clientY)

    if (!elementUnderMouse || !canvas.contains(elementUnderMouse)) {
      if (hoveredMesh || hoveredSlot) {
        hideTooltip()
      }
      hoveredMesh = null
      hoveredSlot = null
      return
    }

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1
    raycaster.setFromCamera(mouse, camera)

    tooltip?.setProps({
      getReferenceClientRect: () =>
        new DOMRect(event.clientX, event.clientY, 0, 0),
    })

    const intersects = raycaster.intersectObjects(bakugansMeshs, false)
    const gatesIntersects = raycaster.intersectObjects(gateCardMeshs, false)

    if (intersects.length > 0) {
      const currentMesh = intersects[0].object as THREE.Sprite

      if (hoveredMesh !== currentMesh) {
        hoveredMesh = currentMesh

        const data = currentMesh.userData as SpriteUserData
        showTooltip(buildBakuganTooltipContent(data))
      }

      hoveredSlot = null
      return
    }

    if (gatesIntersects.length > 0) {
      const currentMesh = gatesIntersects[0].object as THREE.Mesh<
        THREE.PlaneGeometry,
        THREE.MeshStandardMaterial,
        THREE.Object3DEventMap
      >

      if (hoveredSlot !== currentMesh) {
        hoveredSlot = currentMesh

        const content = buildSlotTooltipContent(currentMesh.userData as SlotMeshUsersData)
        if (content) {
          showTooltip(content)
        } else {
          hideTooltip()
        }
      }

      hoveredMesh = null
      return
    }

    if (hoveredMesh || hoveredSlot) {
      hideTooltip()
    }

    hoveredMesh = null
    hoveredSlot = null
  })

  window.addEventListener('resize', () => {
    if (!renderer) return
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
  })

  const animate = () => {
    requestAnimationFrame(animate)
    controls?.update()
    renderer?.render(scene, camera)
  }
  animate()

  ready = true
  applySandboxBoardState({
    snapshot: createEmptySandboxSnapshot(),
    perspectiveUserId: SANDBOX_USER_ID,
  })

  window.parent.postMessage(
    {
      type: 'SANDBOX_READY',
      payload: {
        customAnimationKeys: CUSTOM_ANIMATION_KEYS,
      },
    },
    '*',
  )
}

window.addEventListener('message', (event: MessageEvent) => {
  if (!ready) return

  if (event.data?.type === 'LOAD_SANDBOX_STATE') {
    const payload = event.data.payload as SandboxPayload
    if (!payload?.snapshot) return

    applySandboxBoardState({
      snapshot: payload.snapshot,
      perspectiveUserId: payload.perspectiveUserId ?? SANDBOX_USER_ID,
      actionRequest: payload.actionRequest,
    })

    const animationsToPlay = payload.animationsToPlay
    if (animationsToPlay?.length) {
      // Wait one frame so meshes from InitGameState exist before playAnimation.
      requestAnimationFrame(() => {
        void playSandboxAnimations(animationsToPlay)
      })
    }
    return
  }

  if (event.data?.type === 'PLAY_SANDBOX_ANIMATIONS') {
    const animations = event.data.payload?.animations as AnimationDirectivesTypes[] | undefined
    if (!animations?.length) return
    void playSandboxAnimations(animations)
  }
})

initScene()
