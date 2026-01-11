import { OrbitControls } from 'three/examples/jsm/Addons.js'
import './style.css'
import * as THREE from 'three'
import { PlaneMesh } from './meshes/plane.mesh'
import { createSocket } from './sockets/create-socket'
import { registerSocketHandlers } from './sockets/sockets-handlers'
import { CreateBakuganHoverPreview, RemoveBakuganHoverPreview, type BakuganPreviewData } from './functions/create-bakugan-preview-hover'
import { OnHoverGateCard } from './animations/show-message-animation'

const canvas = document.getElementById('gameboard-canvas')
const params = new URLSearchParams(window.location.search)
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

if (!roomId || !userId) {
  throw new Error("roomId ou userId manquant")
}

const socket = createSocket(userId, roomId)

function setImageWithFallback(imgElement: HTMLImageElement | null, src: string, fallbackSrc: string, fallbackAlt: string) {
  if (!imgElement) return;

  imgElement.src = src;
  imgElement.alt = src;

  // Si l'image ne se charge pas, on met le fallback
  imgElement.onerror = () => {
    imgElement.src = fallbackSrc;
    imgElement.alt = fallbackAlt;
  };
}

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


socket.emit('init-room-state', ({ roomId, userId }))

if (roomId !== null && userId !== null) {
  if (canvas) {
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(window.devicePixelRatio)
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

    // Show bakugan and gate cards data
    const bakugansMeshs: THREE.Sprite<THREE.Object3DEventMap>[] = []
    const gateCardMeshs: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshStandardMaterial, THREE.Object3DEventMap>[] = []
    const raycaster = new THREE.Raycaster()
    const mouse = new THREE.Vector2()
    let hoveredMesh: THREE.Sprite<THREE.Object3DEventMap> | null = null
    let hoveredSlot: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshStandardMaterial, THREE.Object3DEventMap> | null = null

    window.addEventListener('mousemove', (event: MouseEvent) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1

      raycaster.setFromCamera(mouse, camera)

      const intersects = raycaster.intersectObjects(bakugansMeshs, false)
      const gatesIntersects = raycaster.intersectObjects(gateCardMeshs, false)

      if (intersects.length > 0) {
        const currentMesh = intersects[0].object as THREE.Sprite<THREE.Object3DEventMap>

        if (hoveredMesh !== currentMesh) {
          if (hoveredMesh) {
            RemoveBakuganHoverPreview()
          }

          hoveredMesh = currentMesh
          console.log('mouseenter:', hoveredMesh.name)
          CreateBakuganHoverPreview(currentMesh.userData as BakuganPreviewData, { x: mouse.x, y: mouse.y })
        }

      } else {
        if (hoveredMesh) {
          console.log('mouseleave:', hoveredMesh.name)
          RemoveBakuganHoverPreview()
          hoveredMesh = null
        }
      }

      if (gatesIntersects.length > 0) {
        const currentMesh = gatesIntersects[0].object as THREE.Mesh<THREE.PlaneGeometry, THREE.MeshStandardMaterial, THREE.Object3DEventMap>

        if (hoveredSlot !== currentMesh) {
          if (hoveredSlot) {
            document.getElementById('on-hover-gate-card')?.remove()
          }

          hoveredSlot = currentMesh
          if (hoveredSlot.userData.cardName) {
            console.log('mouseenter:', hoveredSlot.userData.cardName)
            const message: string = hoveredSlot.userData.cardName
            OnHoverGateCard({ message: message })
          }
        }

      } else {
        if (hoveredSlot) {
          console.log('mouseleave:', hoveredSlot.userData.cardName)
          document.getElementById('on-hover-gate-card')?.remove()
        }
      }

    })

    registerSocketHandlers(socket, {
      camera: camera,
      light: light,
      plane: plane,
      roomId: roomId,
      scene: scene,
      userId: userId,
      bakugansMeshs: bakugansMeshs,
      gateCardMeshs: gateCardMeshs
    })

    socket.emit("init-room-state", { roomId, userId })

    loop()
    function loop() {
      requestAnimationFrame(loop)
      controls.update()
      renderer.render(scene, camera)
    }

    reload?.addEventListener("click", () => {
      socket.emit("init-room-state", { roomId, userId })
    })

    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    })

  }
}


