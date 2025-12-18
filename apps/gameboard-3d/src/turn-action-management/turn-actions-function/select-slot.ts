import { BakuganList, GateCardsList, Slots, type attribut, type slots_id } from "@bakugan-arena/game-data";
import { slotMesh } from "../../meshes/slot.mesh";
import { getSlotMeshPosition } from "../../functions/get-slot-mesh-position";
import * as THREE from 'three'
import { getAttributColor } from "../../functions/get-attrubut-color";
import type { onBoardBakugans, SelectableBakuganAction, SelectableGateCardAction } from "@bakugan-arena/game-data/src/type/actions-serveur-requests";

export function SelectSlotOnMouseMove({ plane, slots, hoveredSlot, event, camera }: { plane: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial, THREE.Object3DEventMap>, slots: slots_id[], hoveredSlot: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial, THREE.Object3DEventMap> | null, event: MouseEvent, camera: THREE.PerspectiveCamera }): THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial, THREE.Object3DEventMap> | null {

    if (isMouseOverUI(event)) {
        if (hoveredSlot) {
            hoveredSlot.visible = false
        }
        return null
    }

    const raycaster = new THREE.Raycaster()
    const mouse = new THREE.Vector2()
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera)

    let newHoveredSlot = hoveredSlot

    const intersects = raycaster.intersectObjects(plane.children, true)
    if (intersects.length === 0) {
        if (newHoveredSlot) {
            newHoveredSlot.visible = false
            newHoveredSlot = null
        }
    }

    if (intersects[0]) {
        const newSlot = plane.getObjectByName(intersects[0].object.name)
        if (newSlot && !slots.includes(newSlot.name as slots_id)) {
            if (newHoveredSlot !== null) {
                newHoveredSlot.visible = false
                newHoveredSlot = null
            }
        }
        if (newSlot && slots.includes(newSlot.name as slots_id) && newSlot.userData.classes.includes("overable")) {
            if (newHoveredSlot !== null && newHoveredSlot !== newSlot && slots.includes(newSlot.name as slots_id)) {
                newHoveredSlot.visible = false
                newHoveredSlot = newSlot as THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial, THREE.Object3DEventMap>
                newSlot.visible = true
                console.log(intersects[0].object.name)
                console.log(intersects[0].object.userData.classes)

            } else if (!newHoveredSlot && slots.includes(newSlot.name as slots_id)) {
                newHoveredSlot = newSlot as THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial, THREE.Object3DEventMap>
                newSlot.visible = true
                console.log(intersects[0].object.name)
                console.log(intersects[0].object.userData.classes)

            } else if (newHoveredSlot && slots.includes(newSlot.name as slots_id) === false) {
                newHoveredSlot.visible = false
                newHoveredSlot = null
            }

            newSlot.visible = true

        }
    }

    return newHoveredSlot

}

export function SelectCard({ data, selectGateCard, userId, cardsToSelect, card, plane, slots }: {
    data: SelectableGateCardAction,
    selectGateCard: {
        type: "SET_GATE_CARD_ACTION";
        data: {
            key: string;
            userId: string;
            slot: slots_id | "";
        } | undefined;
    },
    userId: string,
    cardsToSelect: NodeListOf<Element>,
    card: Element,
    plane: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial, THREE.Object3DEventMap>
    slots: slots_id[]
}) {

    if (selectGateCard.data && selectGateCard.data.key === data.key) {
        selectGateCard.data = undefined
        cardsToSelect.forEach((c) => {
            c.classList.remove('selected-card')
        })

        console.log(selectGateCard.data)

    } else {
        selectGateCard.data = undefined
        selectGateCard.data = {
            key: data.key,
            slot: '',
            userId: userId
        }

        card.classList.add('selected-card')
        cardsToSelect.forEach((c) => {
            if (c === card) return
            if (c.classList.contains('selected-card')) {
                c.classList.remove('selected-card')
            }
        })

        // slots.forEach((slot) => {
        //     const mesh = plane.getObjectByName(slot)
        //     if (mesh && mesh.userData && mesh.userData.classes.includes('slot-selecter') && (mesh.userData.classes.includes('overable') || mesh.userData.classes.includes('selected-slot'))) {
        //         console.log(mesh.userData, mesh.name)
        //         plane.remove(mesh)
        //     }
        // })
    }

    if (selectGateCard.data === undefined || selectGateCard.data.slot === '') {

        let toRemove: THREE.Object3D[] = []

        slots.forEach((slot) => {
            plane.traverse((mesh) => {
                if (mesh.name === slot) {
                    toRemove.push(mesh)
                }
            })
        })

        toRemove.forEach((mesh) => {
            if (mesh.parent) {
                mesh.parent.remove(mesh)
            }
        })
    }

}

export function SelectAbilityCardForStandardTurn({ data, useAbilityCard, userId, cardsToUse, card, scene, bakugans }: {
    data: SelectableGateCardAction,
    useAbilityCard: {
        type: "USE_ABILITY_CARD";
        data: {
            key: string;
            userId: string;
            bakuganId: string | "";
            slot: slots_id | "";
        } | undefined;
    },
    userId: string,
    cardsToUse: NodeListOf<Element>,
    card: Element,
    scene: THREE.Scene<THREE.Object3DEventMap>
    bakugans: onBoardBakugans[]
}) {

    if (useAbilityCard.type !== "USE_ABILITY_CARD") return
    console.log('first', useAbilityCard.data?.key, useAbilityCard.type)

    if (useAbilityCard.data && useAbilityCard.data.key === data.key) {
        useAbilityCard.data = undefined
        cardsToUse.forEach((c) => {
            c.classList.remove('selected-card')
        })

        console.log(useAbilityCard.data)

    } else {
        useAbilityCard.data = undefined
        useAbilityCard.data = {
            key: data.key,
            userId: userId,
            bakuganId: '',
            slot: '' as slots_id
        }

        card.classList.add('selected-card')
        cardsToUse.forEach((c) => {
            if (c === card) return
            if (c.classList.contains('selected-card')) {
                c.classList.remove('selected-card')
            }
        })

        // slots.forEach((slot) => {
        //     const mesh = plane.getObjectByName(slot)
        //     if (mesh && mesh.userData && mesh.userData.classes.includes('slot-selecter') && (mesh.userData.classes.includes('overable') || mesh.userData.classes.includes('selected-slot'))) {
        //         console.log(mesh.userData, mesh.name)
        //         plane.remove(mesh)
        //     }
        // })
    }

    if (useAbilityCard.data !== undefined) {

        bakugans.forEach((bakugan) => {

            const mesh = scene.getObjectByName(`${bakugan.bakuganKey}-${userId}`) as THREE.Sprite<THREE.Object3DEventMap>
            if (!mesh) return

            if (bakugan.abilities.some((ability) => ability.key === data.key)) {
                mesh.material.opacity = 1
            } else {
                mesh.material.transparent = true
                mesh.material.opacity = 0.5
            }

        })

    } else {
        bakugans.forEach((bakugan) => {

            const mesh = scene.getObjectByName(`${bakugan.bakuganKey}-${userId}`) as THREE.Sprite<THREE.Object3DEventMap>
            if (!mesh) return

            mesh.material.opacity = 1

        })
    }


}

export function SelectBakuganOnMouseMove({ bakugan, event, camera, scene, names }: { bakugan: THREE.Sprite<THREE.Object3DEventMap> | null, event: MouseEvent, camera: THREE.PerspectiveCamera, scene: THREE.Scene<THREE.Object3DEventMap>, names: string[] }): THREE.Sprite<THREE.Object3DEventMap> | null {

    const raycaster = new THREE.Raycaster()
    const mouse = new THREE.Vector2()
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera)

    let selecter: THREE.Sprite<THREE.Object3DEventMap> | null = bakugan

    const intersects = raycaster.intersectObjects(scene.children, true)
    if (intersects.length === 0) {
        if (selecter) {
            selecter.material.color.set('white')
            selecter = null
        }
    }

    if (intersects[0]) {
        const mesh = scene.getObjectByName(intersects[0].object.name) as THREE.Sprite<THREE.Object3DEventMap>
        if (mesh) {
            const color = new THREE.Color(getAttributColor(mesh.userData.attribut))

            if (names.includes(mesh.name)) {
                if (selecter !== null) {
                    if (selecter.name !== mesh.name) {
                        selecter.material.color.set('white')
                        selecter = mesh
                        mesh.material.color.set(color)
                    } else {
                        return selecter
                    }
                } else {
                    if (names.includes(mesh.name)) {
                        selecter = mesh
                        mesh.material.color.set(color)
                    }
                }
            } else {
                selecter?.material.color.set('white')
                selecter = null
                return selecter
            }
        }
    }

    console.log(selecter?.name)

    return selecter

}

export function createOverableSlot(slot: slots_id, plane: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial, THREE.Object3DEventMap>, data: SelectableGateCardAction, overable: boolean) {

    const newSlot = slotMesh.clone()
    const position = getSlotMeshPosition({ index: Slots.indexOf(slot) })
    newSlot.position.set(position.x, position.y, position.z)
    newSlot.name = slot
    newSlot.visible = overable ? false : true
    const texture = new THREE.TextureLoader().load(`./../images/cards/portal_card.png`)
    const cardData = GateCardsList.find((c) => c.key === data.key)
    const gateColor = cardData && cardData.attribut ? getAttributColor(cardData.attribut) : 'crimson'
    const color = new THREE.Color(gateColor)
    newSlot.material.map = texture
    newSlot.material.color = color
    const additionalClass = overable ? 'overable' : 'selected-slot'
    newSlot.userData = {
        classes: ['turn-action-mesh', additionalClass, 'slot-selecter']
    }
    plane.add(newSlot)
}

export function createOverableBakuganSlot(slot: slots_id, plane: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial, THREE.Object3DEventMap>, data: SelectableBakuganAction, overable: boolean) {
    const newSlot = slotMesh.clone()
    const position = getSlotMeshPosition({ index: Slots.indexOf(slot) })
    newSlot.position.set(position.x, 5, position.z)
    newSlot.name = slot
    newSlot.visible = overable ? false : true
    const texture = new THREE.TextureLoader().load(`./../images/cards/portal_card.png`)
    const bakuganData = BakuganList.find((c) => c.key === data.key)
    const gateColor = bakuganData && bakuganData.attribut ? getAttributColor(bakuganData.attribut) : 'crimson'
    const color = new THREE.Color(gateColor)
    newSlot.material.map = texture
    newSlot.material.color = color
    const additionalClass = overable ? 'overable' : 'selected-slot'
    newSlot.userData = {
        classes: ['turn-action-mesh', additionalClass, 'slot-selecter']
    }
    plane.add(newSlot)
}

export function SelectBakugan({ data, selectBakugan, userId, bakuganToSelect, bakugan }: {
    data: SelectableBakuganAction,
    selectBakugan: {
        type: "SET_BAKUGAN";
        data: {
            key: string;
            userId: string;
            slot: slots_id | "";
        } | undefined;
    },
    userId: string,
    bakuganToSelect: NodeListOf<Element>,
    bakugan: Element,
    slots: slots_id[]
}) {

    if (selectBakugan.data && selectBakugan.data.key === data.key) {
        selectBakugan.data = undefined
        bakuganToSelect.forEach((c) => {
            c.classList.remove('selected-bakugan')
        })
    } else {
        selectBakugan.data = undefined
        selectBakugan.data = {
            key: data.key,
            slot: '',
            userId: userId
        }

        bakugan.classList.add('selected-bakugan')
        bakuganToSelect.forEach((c) => {
            if (c === bakugan) return
            if (c.classList.contains('selected-bakugan')) {
                c.classList.remove('selected-bakugan')
            }
        })
    }

}

export function SelectSlotToSetBakugan({ plane, slots, hoveredSlot, event, camera, attribut }: { plane: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial, THREE.Object3DEventMap>, slots: slots_id[], hoveredSlot: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial, THREE.Object3DEventMap> | null, event: MouseEvent, camera: THREE.PerspectiveCamera, attribut: attribut }): THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial, THREE.Object3DEventMap> | null {

    if (isMouseOverUI(event)) {
        if (hoveredSlot) {
            hoveredSlot.material.color.set(0xffffff)
        }
        return null
    }

    const raycaster = new THREE.Raycaster()
    const mouse = new THREE.Vector2()
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera)

    let newHoveredSlot = hoveredSlot

    const intersects = raycaster.intersectObjects(plane.children, true)
    if (intersects.length === 0) {
        if (newHoveredSlot) {
            newHoveredSlot.material.color.set(0xffffff)
            newHoveredSlot = null
        }
    }

    if (intersects[0]) {
        const newSlot = plane.getObjectByName(intersects[0].object.name) as THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial, THREE.Object3DEventMap> | undefined


        if (newSlot && !slots.includes(newSlot.name as slots_id)) {
            if (newHoveredSlot !== null) {
                newHoveredSlot.material.color.set(0xffffff)
                newHoveredSlot = null
            }
        }

        if (newSlot && slots.includes(newSlot.name as slots_id)) {
            const color = new THREE.Color(getAttributColor(attribut))

            if (newHoveredSlot !== null && newHoveredSlot !== newSlot && slots.includes(newSlot.name as slots_id)) {
                newHoveredSlot.material.color.set('white')
                newHoveredSlot = newSlot as THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial, THREE.Object3DEventMap>
                newSlot.material.color.set(color)

            } else if (!newHoveredSlot && slots.includes(newSlot.name as slots_id)) {
                newHoveredSlot = newSlot as THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial, THREE.Object3DEventMap>
                newSlot.material.color.set(color)

            } else if (newHoveredSlot && slots.includes(newSlot.name as slots_id) === false) {
                newSlot.material.color.set('white')
                newHoveredSlot = null
            }
        }

    }

    return newHoveredSlot

}

function isMouseOverUI(event: MouseEvent): boolean {
    const target = event.target as HTMLElement | null
    if (!target) return false

    return Boolean(
        target.closest('.select-bakugan-action') ||
        target.closest('.card-selecter')
    )
}
