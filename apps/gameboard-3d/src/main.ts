import { OrbitControls } from 'three/examples/jsm/Addons.js'
import './style.css'
import * as THREE from 'three'
import { PlaneMesh } from './meshes/plane.mesh'
import { createSocket } from './sockets/create-socket'
import { registerSocketHandlers } from './sockets/sockets-handlers'
import { type BakuganPreviewData } from './functions/create-bakugan-preview-hover'
import { setImageWithFallback } from './functions/set-image-with-fallback'
import { hideTooltip, initTooltip, showTooltip, tooltip } from './functions/tooltips-functions'
import { Bakugans } from '@bakugan-arena/game-data'

const canvas = document.getElementById('gameboard-canvas')
const params = new URLSearchParams(window.location.search)
const parentSocket = params.get('parentSocket')
const roomId = params.get('roomId')
const userId = params.get('userId')
const userImage = params.get('userImage')
const opponentImage = params.get('opponentImage')
const reload = document.getElementById("init-room")
const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100)
const plane = PlaneMesh.clone()

plane.material.transparent = true
camera.position.set(3, 5, 8)
plane.rotateX(-Math.PI / 2)

const referrer = document.referrer
const allowed = import.meta.env.VITE_ALLOWED_PARENT_URL

if (!referrer.startsWith(allowed)) {
  console.error("Accès interdit :", referrer)
  alert("Accès non autorisé")
  // Optionnel : bloquer le jeu
  throw new Error("Unauthorized parent")
}

if (!roomId || !userId) {
  throw new Error("roomId ou userId manquant")
}

const socket = createSocket(userId, roomId)

// Pour l'utilisateur
if (userImage) {
  const left_profile_picture = document.getElementById('left-profile-picture-img');
  setImageWithFallback(
    left_profile_picture as HTMLImageElement,
    userImage,
    '/images/default-profil-picture.png',
    'default profile picture'
  );
}

// Pour l’adversaire
if (opponentImage) {
  const right_profile_picture = document.getElementById('right-profile-picture-img');
  setImageWithFallback(
    right_profile_picture as HTMLImageElement,
    opponentImage,
    '/images/default-profil-picture.png',
    'default profile picture'
  );
}


socket.emit('init-room-state', ({ roomId, userId, parentSocket }))

if (roomId !== null && userId !== null) {

  if (canvas) {
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

    registerSocketHandlers(socket, {
      camera: camera,
      light: light,
      plane: plane,
      roomId: roomId,
      scene: scene,
      userId: userId,
      bakugansMeshs: bakugansMeshs,
      gateCardMeshs: gateCardMeshs,
    })

    socket.emit('init-room-state', ({ roomId, userId, parentSocket }))

    loop()
    function loop() {
      requestAnimationFrame(loop)
      controls.update()
      renderer.render(scene, camera)
    }

    reload?.addEventListener("click", () => {
      socket.emit('init-room-state', ({ roomId, userId, parentSocket }))
    })

    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    })


  }
}


