import { OrbitControls } from 'three/examples/jsm/Addons.js'
import './style.css'
import * as THREE from 'three'
import { PlaneMesh } from './meshes/plane.mesh'
import { CreateBakuganHoverPreview, RemoveBakuganHoverPreview, type BakuganPreviewData } from './functions/create-bakugan-preview-hover'
import { OnHoverGateCard } from './animations/show-message-animation'
import { type ActivePlayerActionRequestType, type portalSlotsTypeElement, type roomStateType } from '@bakugan-arena/game-data'
import { InitGameState } from './functions/init-game-state'
import { DragAndElimineAnimation } from './animations/drag-and-elimine-animation'
import { ReviveBakuganAnimation } from './animations/revive-animation'
import { TurnActionInterfaceBuilder } from './turn-action-management/turn-interface-builder'

const canvas = document.getElementById('gameboard-canvas')
// const reload = document.getElementById("init-room")
const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100)
const plane = PlaneMesh.clone()
plane.material.transparent = true
camera.position.set(3, 5, 1)
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
    bakugans: [{
        id: 1,
        abilityBlock: false,
        assist: true,
        attribut: 'Pyrus',
        currentPower: 500,
        family: 'dragonoid',
        image: 'dragonoid',
        key: 'dragonoid-pyrus',
        powerLevel: 370,
        slot_id: 'slot-3',
        userId: userId
    }],
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
        ability_card_block: {
            blocked: false,
            reason: null,
            turn: 0
        }
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

const request: ActivePlayerActionRequestType = {
    target: 'ACTIVE_PLAYER',
    actions: {
        mustDo: [
            {
                type: "SELECT_GATE_CARD",
                data: 
                    
                    [{
                        key: "mine-ghost",
                        description: "Eh !",
                        image: 'command-gate-card.png',
                        name: 'Mine Ghost'
                    }, {
                        key: "mine-ghost",
                        description: "Eh !",
                        image: 'command-gate-card.png',
                        name: 'Mine Ghost'
                    }, {
                        key: "mine-ghost",
                        description: "Eh !",
                        image: 'command-gate-card.png',
                        name: 'Mine Ghost'
                    }, {
                        key: "mine-ghost",
                        description: "Eh !",
                        image: 'command-gate-card.png',
                        name: 'Mine Ghost'
                    }, {
                        key: "mine-ghost",
                        description: "Eh !",
                        image: 'command-gate-card.png',
                        name: 'Mine Ghost'
                    }]
                
            },
            // {
            //     type: 'SET_BAKUGAN',
            //     data: {
            //         bakugans: [{
            //             key: 'hyranoid-darkus',
            //             name: 'Hydranoid',
            //             currentPower: 450,
            //             attribut: 'Darkus',
            //             image: 'hydranoid'
            //         }],
            //         setableSlots: ["slot-5"]
            //     }
            // },
            // {
            //     type: 'USE_ABILITY_CARD',
            //     data: [
            //         {
            //             abilities: [{
            //                 description: 'eh',
            //                 key: 'scarlet-twister',
            //                 image: 'ability_card_VENTUS',
            //                 name: 'Blow Away'
            //             }],
            //             attribut: 'Ventus',
            //             bakuganKey: 'dragonoid-pyrus',
            //             slot: 'slot-3'
            //         },
            //         {
            //             abilities: [{
            //                 description: 'eh',
            //                 key: 'blow-away',
            //                 image: 'ability_card_VENTUS',
            //                 name: 'Blow Away'
            //             }],
            //             attribut: 'Ventus',
            //             bakuganKey: 'dragonoid-pyrus',
            //             slot: 'slot-3'
            //         },
            //                             {
            //             abilities: [{
            //                 description: 'eh',
            //                 key: 'scarlet-twister2',
            //                 image: 'ability_card_VENTUS',
            //                 name: 'Blow Away'
            //             }],
            //             attribut: 'Ventus',
            //             bakuganKey: 'dragonoid-pyrus',
            //             slot: 'slot-3'
            //         },
            //     ]
            // }
        ],
        mustDoOne: [],
        optional: []
    }
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

    const texture = new THREE.TextureLoader().load('./images/cards/empty-gate-slot.jpg')

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

    scene.add(bgPlane)

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

    TurnActionInterfaceBuilder({ request: request })

    // ********************************** INIT TEST GAME STATE (END) ********************************** \\


    // ********************************** ANIMATIONS TESTS ********************************** \\

    const moveGateCardButton = document.getElementById("move-gate--card")

    moveGateCardButton?.addEventListener('click', async () => {

        // const newSlot: portalSlotsTypeElement = {
        //     ...Slot2,
        //     id: 'slot-6'
        // }
        console.log(Slot2.bakugans[0])
        console.log(slot3.bakugans[0])

        const bakuganToRevive = {
            key: 'siege-pyrus',
            userId: userId
        }

        await ReviveBakuganAnimation({
            scene: scene,
            camera: camera,
            userId: userId,
            bakuganKey: bakuganToRevive.key,
            bakuganUserId: bakuganToRevive.userId
        })

        await DragAndElimineAnimation({
            bakugan: Slot2.bakugans[0],
            cardUser: slot3.bakugans[0],
            scene: scene
        })
        await DragAndElimineAnimation({
            bakugan: Slot2.bakugans[1],
            cardUser: slot3.bakugans[0],
            scene: scene
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