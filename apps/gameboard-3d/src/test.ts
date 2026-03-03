import { OrbitControls } from 'three/examples/jsm/Addons.js'
import './style.css'
import * as THREE from 'three'
import { PlaneMesh } from './meshes/plane.mesh'
import { CreateBakuganHoverPreview, RemoveBakuganHoverPreview, type BakuganPreviewData } from './functions/create-bakugan-preview-hover'
import { OnHoverGateCard } from './animations/show-message-animation'
import { type portalSlotsTypeElement, type roomStateType } from '@bakugan-arena/game-data'
import { InitGameState } from './functions/init-game-state'
import { SwipeGateCards } from './animations/swipe-gate-cards'
import { RemoveRenforAnimation } from './animations/remove-renfort-animation'

const canvas = document.getElementById('gameboard-canvas')
// const reload = document.getElementById("init-room")
const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100)
const plane = PlaneMesh.clone()
plane.material.transparent = true
camera.position.set(3, 5, 8)
plane.rotateX(-Math.PI / 2)

// TEST PAGE GAME STATE

const userId = '1'
const opponentId = '2'

const Slot2: portalSlotsTypeElement = {
    id: 'slot-2',
    activateAbilities: [],
    bakugans: [
        {
            id: 1,
            abilityBlock: false,
            assist: false,
            attribut: 'Haos',
            currentPower: 500,
            family: 'tigrerra',
            image: 'tigrerra',
            key: 'tigrerra-haos',
            powerLevel: 370,
            slot_id: 'slot-2',
            userId: userId
        },
        {
            id: 2,
            abilityBlock: false,
            assist: false,
            attribut: 'Darkus',
            currentPower: 400,
            family: 'mantris',
            image: 'mantris',
            key: 'mantris-darkus',
            powerLevel: 370,
            slot_id: 'slot-2',
            userId: opponentId
        },
        {
            id: 2,
            abilityBlock: false,
            assist: true,
            attribut: 'Pyrus',
            currentPower: 500,
            family: 'dragonoid',
            image: 'dragonoid',
            key: 'dragonoid-pyrus',
            powerLevel: 370,
            slot_id: 'slot-2',
            userId: userId
        }
    ],
    can_set: false,
    portalCard: {
        key: 'reacteur-haos',
        userId: userId
    },
    state: {
        blocked: false,
        canceled: false,
        open: true
    }
}

const slot3: portalSlotsTypeElement = ({
    id: 'slot-3',
    activateAbilities: [],
    bakugans: [],
    can_set: false,
    portalCard: {
        key: 'echange',
        userId: userId
    },
    state: {
        blocked: false,
        canceled: false,
        open: false
    }
})

const state: roomStateType = {
    battleState: {
        battleInProcess: true,
        paused: false,
        slot: 'slot-2',
        turns: 2
    },
    eliminated: {
        opponnent: 2,
        user: 1
    },
    deck: [],
    timers: [{
        userId: userId,
        timer: 2 * 60
    }, {
        timer: 3 * 60,
        userId: opponentId
    }],
    turnState: {
        can_change_player_turn: true,
        previous_turn: opponentId,
        set_new_bakugan: true,
        set_new_gate: true,
        turn: userId,
        turnCount: 5,
        use_ability_card: true,
    },
    finished: undefined,
    portalSlots: [
        structuredClone(Slot2),
        structuredClone(slot3),
        structuredClone({
            id: 'slot-5',
            activateAbilities: [],
            bakugans: [],
            can_set: false,
            portalCard: {
                key: 'reacteur-pyrus',
                userId: opponentId
            },
            state: {
                blocked: false,
                canceled: false,
                open: false
            }
        })
    ]
}

console.log(Slot2.bakugans[0])


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

    // Show bakugan and gate cards data
    const bakugansMeshs: THREE.Sprite<THREE.Object3DEventMap>[] = []
    const gateCardMeshs: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshStandardMaterial, THREE.Object3DEventMap>[] = []
    const raycaster = new THREE.Raycaster()
    const mouse = new THREE.Vector2()
    let hoveredMesh: THREE.Sprite<THREE.Object3DEventMap> | null = null
    let hoveredSlot: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshStandardMaterial, THREE.Object3DEventMap> | null = null

    window.addEventListener('mousemove', (event: MouseEvent) => {

        const elementUnderMouse = document.elementFromPoint(
            event.clientX,
            event.clientY
        )

        // Si la souris n’est PAS au-dessus du canvas → on annule
        if (!elementUnderMouse || !canvas.contains(elementUnderMouse)) {
            if (hoveredMesh) {
                RemoveBakuganHoverPreview()
                hoveredMesh = null
            }

            if (hoveredSlot) {
                document.getElementById('on-hover-gate-card')?.remove()
                hoveredSlot = null
            }

            return
        }

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
                CreateBakuganHoverPreview(currentMesh.userData as BakuganPreviewData, { x: mouse.x, y: mouse.y })
            }

        } else {
            if (hoveredMesh) {
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
                    const message: string = hoveredSlot.userData.cardName
                    OnHoverGateCard({ message: message })
                }
            }

        } else {
            if (hoveredSlot) {
                document.getElementById('on-hover-gate-card')?.remove()
            }
        }

    })

    // ********************************** INIT TEST GAME STATE ********************************** \\

    InitGameState({ state: state, bakugansMeshs, gateCardMeshs, plane, scene, userId })

    // ********************************** INIT TEST GAME STATE (END) ********************************** \\


    // ********************************** ANIMATIONS TESTS ********************************** \\

    const moveGateCardButton = document.getElementById("move-gate--card")

    moveGateCardButton?.addEventListener('click', async () => {

        // const newSlot: portalSlotsTypeElement = {
        //     ...Slot2,
        //     id: 'slot-6'
        // }


        await RemoveRenforAnimation({
            userId: userId,
            bakugan: {
                id: 2,
                abilityBlock: false,
                assist: true,
                attribut: 'Pyrus',
                currentPower: 500,
                family: 'dragonoid',
                image: 'dragonoid',
                key: 'dragonoid-pyrus',
                powerLevel: 370,
                slot_id: 'slot-2',
                userId: userId
            }
        })
    })


    // ********************************** ANIMATIONS TESTS (END) ********************************** \\


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