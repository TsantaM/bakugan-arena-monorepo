import { OrbitControls } from 'three/examples/jsm/Addons.js'
import './style.css'
import * as THREE from 'three'
import { PlaneMesh } from './meshes/plane.mesh'
import { createSocket } from './sockets/create-socket'
import { registerSocketHandlers } from './sockets/sockets-handlers'

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

if (userImage) {
  const left_profile_picture = document.getElementById('left-profile-picture-img')
  if (left_profile_picture) left_profile_picture.setAttribute('src', userImage)
}

if (opponentImage) {
  const right_profile_picture = document.getElementById('right-profile-picture-img')
  if (right_profile_picture) right_profile_picture.setAttribute('src', opponentImage)
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

    registerSocketHandlers(socket, {
      camera: camera,
      light: light,
      plane: plane,
      roomId: roomId,
      scene: scene,
      userId: userId
    })

    socket.emit("init-room-state", { roomId })

    loop()
    function loop() {
      requestAnimationFrame(loop)
      controls.update()
      renderer.render(scene, camera)
    }

    reload?.addEventListener("click", () => {
      socket.emit("init-room-state", { roomId })
    })

    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    })

  }
}


