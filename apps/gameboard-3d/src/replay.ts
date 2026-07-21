import { OrbitControls } from 'three/examples/jsm/Addons.js'
import './style.css'
import * as THREE from 'three'
import { PlaneMesh } from './meshes/plane.mesh'
// import { createSocket } from './sockets/create-socket'
// import { registerSocketHandlersViewers } from './sockets/sockets-handlers'
import { type BakuganPreviewData } from './functions/create-bakugan-preview-hover'
import { setImageWithFallback } from './functions/set-image-with-fallback'
import { hideTooltip, initTooltip, showTooltip, tooltip } from './functions/tooltips-functions'
import { Bakugans, normalizeReplayData } from '@bakugan-arena/game-data'
import type { replayDataType, replayEntryType } from "@bakugan-arena/game-data"
import { playAnimation } from './sockets/sockets-handlers'
import { applyReplaySnapshotUi } from './functions/apply-replay-snapshot-ui'
import { applyReplayBoardState } from './functions/apply-replay-board-state'
import { setReplayPaused, waitWhilePaused } from './functions/replay-pause'
import { notifyParentTurnEnd } from './functions/send-message-to-parent'
import { collectReplayAnimationBatch } from './functions/collect-replay-animation-batch'
import {
  abortReplayPlayback,
  consumeSeekTarget,
  findNextTurnStart,
  findPrevTurnStart,
  peekSeekTarget,
  requestReplaySeek,
  waitForSeekAbort,
} from './functions/replay-seek'

type ActiveReplayPlayback = {
  entries: replayEntryType[]
  currentIndex: number
  generation: number
}

let playbackGeneration = 0
let activePlayback: ActiveReplayPlayback | null = null

// alert('eh replay')

const canvas = document.getElementById('gameboard-canvas')
const params = new URLSearchParams(window.location.search)
// const parentSocket = params.get('parentSocket')
const roomId = params.get('roomId')
const replayData = params.get('replayData')
const player1Image = params.get('player1Image')
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

async function initReplay(replayPayload: replayDataType) {
  if (roomId !== null) {
    if (canvas) {

      const { player1, player2, replay, initialSnapshot } = replayPayload

      if (!player1) return
      if (!player2) return

      // Même rôle que userId dans main.ts : perspective "locale" (gauche)
      const perspectiveUserId = player1.id

      const generation = ++playbackGeneration
      abortReplayPlayback()

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

      const keepObjects = [bgPlane, plane, light, camera]

      applyReplayBoardState({
        snapshot: initialSnapshot,
        perspectiveUserId,
        scene,
        plane,
        bakugansMeshs,
        gateCardMeshs,
        keepObjects,
      })

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

      const playback: ActiveReplayPlayback = {
        entries: replay,
        currentIndex: 0,
        generation,
      }
      activePlayback = playback

      const seekToIndex = (targetIndex: number) => {
        const snapshot = targetIndex <= 0
          ? initialSnapshot
          : replay[targetIndex].stateBefore

        applyReplayBoardState({
          snapshot,
          perspectiveUserId,
          scene,
          plane,
          bakugansMeshs,
          gateCardMeshs,
          keepObjects,
        })
        playback.currentIndex = Math.max(0, targetIndex)
      }

      while (generation === playbackGeneration) {
        const seekTarget = consumeSeekTarget()
        if (seekTarget !== null) {
          seekToIndex(seekTarget)
          continue
        }

        // Fin du replay : rester à l'écoute des seeks (restart / tour précédent)
        if (playback.currentIndex >= replay.length) {
          await waitForSeekAbort()
          continue
        }

        await waitWhilePaused()
        if (generation !== playbackGeneration) return
        if (peekSeekTarget() !== null) continue

        const entry = replay[playback.currentIndex]
        applyReplaySnapshotUi(entry.stateBefore, perspectiveUserId)

        if (entry.animation) {
          await waitWhilePaused()
          if (generation !== playbackGeneration) return
          if (peekSeekTarget() !== null) continue

          // Même regroupement que playAnimation (POWER_CHANGE consécutifs en parallèle)
          const { animations: batch, endIndex } = collectReplayAnimationBatch(
            replay,
            playback.currentIndex
          )

          await Promise.race([
            playAnimation(perspectiveUserId, false, camera, scene, plane, bakugansMeshs, gateCardMeshs, batch),
            waitForSeekAbort(),
          ])

          if (generation !== playbackGeneration) return
          if (peekSeekTarget() !== null) continue

          applyReplaySnapshotUi(replay[endIndex].stateAfter, perspectiveUserId)

          for (let j = playback.currentIndex; j <= endIndex; j++) {
            if (replay[j].marker === 'turn_end') {
              notifyParentTurnEnd()
            }
          }

          playback.currentIndex = endIndex + 1
          continue
        }

        applyReplaySnapshotUi(entry.stateAfter, perspectiveUserId)

        if (entry.marker === 'turn_end') {
          notifyParentTurnEnd()
        }

        playback.currentIndex++
      }

    }
  }
}

function startReplay(rawReplay: unknown) {
  const replayPayload = normalizeReplayData(rawReplay)
  initReplay(replayPayload)
}

window.addEventListener('message', (event) => {
  if (!event.data?.type) return

  if (event.data.type === 'LOAD_REPLAY') {
    setReplayPaused(true)
    startReplay(event.data.payload)
    return
  }

  if (event.data.type === 'REPLAY_PAUSE') {
    setReplayPaused(true)
    return
  }

  if (event.data.type === 'REPLAY_PLAY') {
    setReplayPaused(false)
    return
  }

  if (event.data.type === 'REPLAY_NEXT_TURN') {
    if (!activePlayback) return
    const next = findNextTurnStart(activePlayback.entries, activePlayback.currentIndex)
    if (next !== null) requestReplaySeek(next)
    return
  }

  if (event.data.type === 'REPLAY_PREV_TURN') {
    if (!activePlayback) return
    const prev = findPrevTurnStart(activePlayback.entries, activePlayback.currentIndex)
    if (prev !== null) requestReplaySeek(prev)
    return
  }

  if (event.data.type === 'REPLAY_RESTART') {
    if (!activePlayback) return
    requestReplaySeek(0)
  }
})

if (replayData !== null) {
  try {
    startReplay(JSON.parse(decodeURIComponent(replayData)))
  } catch {
    startReplay(JSON.parse(replayData))
  }
}

