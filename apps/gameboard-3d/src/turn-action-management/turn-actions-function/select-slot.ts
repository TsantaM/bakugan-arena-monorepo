import { GateCardsList, Slots, type slots_id } from "@bakugan-arena/game-data";
import { slotMesh } from "../../meshes/slot.mesh";
import { getSlotMeshPosition } from "../../functions/get-slot-mesh-position";
import * as THREE from 'three'
import { getAttributColor } from "../../functions/get-attrubut-color";
import type { SelectableGateCardAction } from "@bakugan-arena/game-data/src/type/actions-serveur-requests";

export function SelectSlotOnMouseMove({ plane, slots, hoveredSlot, event, camera }: { plane: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial, THREE.Object3DEventMap>, slots: slots_id[], hoveredSlot: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial, THREE.Object3DEventMap> | null, event: MouseEvent, camera: THREE.PerspectiveCamera }): THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial, THREE.Object3DEventMap> | null {

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
        alert("1")
        selectGateCard.data = undefined
        cardsToSelect.forEach((c) => {
            c.classList.remove('selected-card')
        })

        console.log(selectGateCard.data)

    } else {
        alert('2')
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
        console.log("1", plane.children.map((c) => c.name))
        console.log('eh')

        let toRemove: THREE.Object3D[] = []


        console.log("2", plane.children.map((c) => c.name))
        slots.forEach((slot) => {
            plane.traverse((mesh) => {
                if (mesh.name === slot) {
                    toRemove.push(mesh)
                }
            })
        })

        toRemove.forEach((mesh) => {
            if(mesh.parent) {
                mesh.parent.remove(mesh)
            }
        })
    }

    plane.children.forEach((child) => {
        console.log(child.name, child.userData.userData)
    })

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