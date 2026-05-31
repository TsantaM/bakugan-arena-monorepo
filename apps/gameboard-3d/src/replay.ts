import { OrbitControls } from 'three/examples/jsm/Addons.js'
import './style.css'
import * as THREE from 'three'
import { PlaneMesh } from './meshes/plane.mesh'
// import { createSocket } from './sockets/create-socket'
// import { registerSocketHandlersViewers } from './sockets/sockets-handlers'
import { type BakuganPreviewData } from './functions/create-bakugan-preview-hover'
import { setImageWithFallback } from './functions/set-image-with-fallback'
import { hideTooltip, initTooltip, showTooltip, tooltip } from './functions/tooltips-functions'
import { Bakugans } from '@bakugan-arena/game-data'
import type { replayDataType, roomStateType } from "@bakugan-arena/game-data"
import { InitGameState } from './functions/init-game-state'
import { playAnimation } from './sockets/sockets-handlers'

// alert('eh replay')

const canvas = document.getElementById('gameboard-canvas')
const params = new URLSearchParams(window.location.search)
// const parentSocket = params.get('parentSocket')
const roomId = params.get('roomId')
const replayData = params.get('replayData')
const player1Image = params.get('player1Image')
const player1Id = params.get('player1Id')
const player2Image = params.get('player2Image')
// const reload = document.getElementById("init-room")
const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100)
const plane = PlaneMesh.clone()
plane.material.transparent = true
camera.position.set(3, 5, 8)
plane.rotateX(-Math.PI / 2)

if (!roomId) {
  throw new Error("roomId ou userId manquant")
}

// const socket = createSocket(userId, roomId)

// Pour l'utilisateur
if (player1Image) {
  const left_profile_picture = document.getElementById('left-profile-picture-img');
  setImageWithFallback(
    left_profile_picture as HTMLImageElement,
    player1Image,
    '/images/default-profil-picture.png',
    'default profile picture'
  );
}

// Pour l’adversaire
if (player2Image) {
  const right_profile_picture = document.getElementById('right-profile-picture-img');
  setImageWithFallback(
    right_profile_picture as HTMLImageElement,
    player2Image,
    '/images/default-profil-picture.png',
    'default profile picture'
  );
}

async function initReplay(replayData: replayDataType) {
  if (roomId !== null && player1Id !== null) {
    if (canvas) {

      const { player1, player2, replay } = replayData

      if (!player1) return
      if (!player2) return

      const state: roomStateType = {
        battleState: {
          battleInProcess: false,
          paused: false,
          slot: null,
          turns: 0
        },
        eliminated: {
          opponnent: 0,
          user: 0
        },
        deck: [],
        timers: [{
          userId: player1Id,
          timer: 2 * 60
        }, {
          timer: 3 * 60,
          userId: player2?.id
        }],
        turnState: {
          can_change_player_turn: true,
          previous_turn: player2?.id,
          set_new_bakugan: true,
          set_new_gate: true,
          turn: player1Id,
          turnCount: 5,
          use_ability_card: true,
          ability_card_block: {
            blocked: false,
            reason: null,
            turn: 0
          }
        },
        finished: undefined,
        portalSlots: [
          {
            id: "slot-1",
            can_set: false,
            portalCard: null,
            activateAbilities: [],
            bakugans: [],
            state: {
              open: false,
              canceled: false,
              blocked: false
            }
          },
          {
            id: "slot-2",
            can_set: true,
            portalCard: null,
            activateAbilities: [],
            bakugans: [],
            state: {
              open: false,
              canceled: false,
              blocked: false
            }
          },
          {
            id: "slot-3",
            can_set: false,
            portalCard: null,
            activateAbilities: [],
            bakugans: [],
            state: {
              open: false,
              canceled: false,
              blocked: false
            }
          },
          {
            id: "slot-4",
            can_set: false,
            portalCard: null,
            activateAbilities: [],
            bakugans: [],
            state: {
              open: false,
              canceled: false,
              blocked: false
            }
          },
          {
            id: "slot-5",
            can_set: false,
            portalCard: null,
            activateAbilities: [],
            bakugans: [],
            state: {
              open: false,
              canceled: false,
              blocked: false
            }
          },
          {
            id: "slot-6",
            can_set: false,
            portalCard: null,
            activateAbilities: [],
            bakugans: [],
            state: {
              open: false,
              canceled: false,
              blocked: false
            }
          },
        ]
      }

      // const { player1, player2, replay  } = replayData

      const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
      renderer.setSize(window.innerWidth, window.innerHeight)
      renderer.setPixelRatio(window.devicePixelRatio)
      const controls = new OrbitControls(camera, renderer.domElement)

      controls.mouseButtons = {
        LEFT: THREE.MOUSE.PAN,
        MIDDLE: THREE.MOUSE.DOLLY,
        RIGHT: THREE.MOUSE.ROTATE
      }

      controls.touches = {
        ONE: THREE.TOUCH.PAN,
        TWO: THREE.TOUCH.DOLLY_ROTATE
      }

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

      // const bgTexture = new THREE.TextureLoader().load(`./../images/attributs-background/VENTUS.png`)
      const bgColor = new THREE.Color(0x808080)
      // scene.background = bgTexture
      scene.background = bgColor

      // Show bakugan and gate cards data
      const bakugansMeshs: THREE.Sprite<THREE.Object3DEventMap>[] = []
      const gateCardMeshs: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshStandardMaterial, THREE.Object3DEventMap>[] = []
      const raycaster = new THREE.Raycaster()
      const mouse = new THREE.Vector2()
      let hoveredMesh: THREE.Sprite<THREE.Object3DEventMap> | null = null
      let hoveredSlot: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshStandardMaterial, THREE.Object3DEventMap> | null = null

      initTooltip()

      window.addEventListener('mousemove', (event: MouseEvent) => {

        const elementUnderMouse = document.elementFromPoint(
          event.clientX,
          event.clientY
        )

        // ❌ Hors canvas → reset propre
        if (!elementUnderMouse || !canvas.contains(elementUnderMouse)) {
          if (hoveredMesh || hoveredSlot) {
            hideTooltip()
          }

          hoveredMesh = null
          hoveredSlot = null
          return
        }

        // ✅ Position souris (IMPORTANT)
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1

        raycaster.setFromCamera(mouse, camera)

        // ✅ Update position tooltip (CRITIQUE)
        tooltip?.setProps({
          getReferenceClientRect: () =>
            new DOMRect(
              event.clientX,
              event.clientY,
              0,
              0
            ),
        })

        const intersects = raycaster.intersectObjects(bakugansMeshs, false)
        const gatesIntersects = raycaster.intersectObjects(gateCardMeshs, false)

        // =========================
        // 🎯 BAKUGAN
        // =========================
        if (intersects.length > 0) {
          const currentMesh = intersects[0].object as THREE.Sprite

          if (hoveredMesh !== currentMesh) {
            hoveredMesh = currentMesh

            const data = currentMesh.userData as BakuganPreviewData
            const bakuganName = Bakugans[data.bakuganKey].name

            showTooltip(`
                <strong>${bakuganName}</strong><br/>
                Power: ${data.powerLevel}
                `)
          }

          // ⚠️ IMPORTANT → empêcher le gate card de overwrite
          hoveredSlot = null
          return
        }

        // =========================
        // 🎯 GATE CARD
        // =========================
        if (gatesIntersects.length > 0) {
          const currentMesh = gatesIntersects[0].object as THREE.Mesh

          if (hoveredSlot !== currentMesh) {
            hoveredSlot = currentMesh as THREE.Mesh<THREE.PlaneGeometry, THREE.MeshStandardMaterial, THREE.Object3DEventMap>
            console.log('hovered slot', hoveredSlot.userData.cardName)
            if (currentMesh.userData.cardName) {
              showTooltip(`<strong>${currentMesh.userData.cardName}</strong>`)
            } else {
              hideTooltip()
            }
          }

          hoveredMesh = null
          return
        }

        // =========================
        // ❌ RIEN HOVER
        // =========================
        if (hoveredMesh || hoveredSlot) {
          hideTooltip()
        }

        hoveredMesh = null
        hoveredSlot = null
      })

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

      alert('on arrive au initState')

      InitGameState({ state: state, bakugansMeshs, gateCardMeshs, plane, scene, userId: player1.id, isSpectator: true })

      alert('on arrive après le initState')

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

      await playAnimation(player1Id, true, camera, scene, plane, bakugansMeshs, gateCardMeshs, replay) // important de mettre isSpectator à true pour éviter les problèmes de synchro du replay

    }
  }
}

console.log(replayData);

if (replayData !== null) {
  const replay: replayDataType = JSON.parse(replayData)
  console.log(replay)
  initReplay(replay)
}

