import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/Addons.js'
import { PlaneMesh } from './meshes/plane.mesh'
import { AddBakugan, InitTestBattleField } from './test-functions/init-test-battlefield'
import type { portalSlotsType } from '@bakugan-arena/game-data'
import { OnBattleEndAnimation } from './animations/on-battle-end-animation'
import { TurnActionBuilder } from './turn-action-management'
import { TurnActionData } from './test-functions/test-variables/turn-action-test'
import { io } from 'socket.io-client'
import { ShowMessageAnimation } from './animations/show-message-animation'
import type { Message } from '@bakugan-arena/game-data/src/type/animations-directives'

const canvas = document.getElementById('gameboard-canvas')
const userId = 'user-1';
const roomId = '12345';

const slots: portalSlotsType = [
    {
        id: 'slot-2',
        state: {
            open: true,
            blocked: false,
            canceled: false
        },
        activateAbilities: [],
        bakugans: [{
            id: 1,
            abilityBlock: false,
            assist: false,
            attribut: 'Haos',
            currentPower: 350,
            family: 'mantris',
            image: 'mantris',
            key: 'mantris-haos',
            powerLevel: 350,
            slot_id: 'slot-2',
            userId: 'user-1'
        },
        {
            id: 2,
            abilityBlock: false,
            assist: false,
            attribut: 'Darkus',
            currentPower: 350,
            family: 'centipod',
            image: 'centipod',
            key: 'centipod-darkus',
            powerLevel: 350,
            slot_id: 'slot-2',
            userId: 'user-2'
        },
        {
            id: 3,
            abilityBlock: false,
            assist: false,
            attribut: 'Haos',
            currentPower: 350,
            family: 'siege',
            image: 'siege',
            key: 'siege-haos',
            powerLevel: 350,
            slot_id: 'slot-2',
            userId: 'user-1'
        }
        ],
        can_set: false,
        portalCard: {
            key: 'reacteur-haos',
            userId: 'user-1'
        }
    },
    {
        id: 'slot-5',
        state: {
            open: false,
            blocked: false,
            canceled: false
        },
        activateAbilities: [],
        bakugans: [],
        can_set: false,
        portalCard: {
            key: 'reacteur-darkus',
            userId: 'user-2'
        }
    }
]

if (canvas) {
    const scene = new THREE.Scene()
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(window.devicePixelRatio)
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100)
    const controls = new OrbitControls(camera, renderer.domElement)
    const bakugansMeshs: THREE.Sprite<THREE.Object3DEventMap>[] = []
    const light = new THREE.AmbientLight('white', 3)
    const plane = PlaneMesh.clone()
    plane.material.transparent = true
    const socket = io()

    camera.position.set(3, 5, 8)

    plane.rotateX(-Math.PI / 2)
    const grid = new THREE.GridHelper(12, 12)

    scene.add(plane)
    scene.add(light)
    scene.add(camera)
    scene.add(grid)

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

    InitTestBattleField({
        plane: plane,
        scene: scene,
        userId: userId,
        slots: slots
    })

    document.getElementById('add-bakugan')?.addEventListener('click', () => {

        const messages: Message[] = [{
            text: 'Bakugan au combat',
            userName: 'Gland'
        }, {
            text: 'Bakugan transformation',
            userName: 'Gland'
        }]

        AddBakugan({
            scene: scene,
            userId: userId,
            camera: camera,
            slots: slots,

        })
        ShowMessageAnimation({
            messages: messages
        })
    })

    document.getElementById('finish-fight')?.addEventListener('click', () => {
        OnBattleEndAnimation()
        TurnActionBuilder({
            request: TurnActionData,
            userId: userId,
            camera: camera,
            scene: scene,
            plane: plane,
            roomId: roomId,
            socket: socket
        })
    })

    // Show bakugan data
    const raycaster = new THREE.Raycaster()
    const mouse = new THREE.Vector2()
    let hoveredMesh: THREE.Sprite<THREE.Object3DEventMap> | null = null

    window.addEventListener('mousemove', (event: MouseEvent) => {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1

        raycaster.setFromCamera(mouse, camera)

        const intersects = raycaster.intersectObjects(bakugansMeshs, false)

        if (intersects.length > 0) {
            const currentMesh = intersects[0].object as THREE.Sprite<THREE.Object3DEventMap>

            if (hoveredMesh !== currentMesh) {
                if (hoveredMesh) {
                    console.log('mouseleave:', hoveredMesh.name)
                }

                hoveredMesh = currentMesh
                console.log('mouseenter:', hoveredMesh.name)
            }
        } else {
            if (hoveredMesh) {
                console.log('mouseleave:', hoveredMesh.name)
                hoveredMesh = null
            }
        }
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

}