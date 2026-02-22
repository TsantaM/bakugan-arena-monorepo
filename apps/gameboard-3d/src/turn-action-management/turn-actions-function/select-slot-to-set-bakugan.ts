import type { attribut, slots_id } from "@bakugan-arena/game-data"
import { isMouseOverUI } from "./is-mouse-over-ui"
import * as THREE from 'three'
import { getAttributColor } from "../../functions/get-attrubut-color"

export function SelectSlotToSetBakugan({ plane, slots, hoveredSlot, event, camera, attribut }: { plane: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial, THREE.Object3DEventMap>, slots: slots_id[], hoveredSlot: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial, THREE.Object3DEventMap> | null, event: MouseEvent, camera: THREE.PerspectiveCamera, attribut: attribut }): THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial, THREE.Object3DEventMap> | null {

    if (isMouseOverUI(event)) {
        if (hoveredSlot) {
            if (hoveredSlot.userData.isCanceled === true) {
                hoveredSlot.material.color.set(0.1, 0.1, 0.1)
            } else {
                hoveredSlot.material.color.set(0xffffff)
            }
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
            if (newHoveredSlot.userData.isCanceled === true) {
                newHoveredSlot.material.color.set(0.1, 0.1, 0.1)
            } else {
                newHoveredSlot.material.color.set(0xffffff)
            }
            newHoveredSlot = null
        }
    }

    if (intersects[0]) {
        const newSlot = plane.getObjectByName(intersects[0].object.name) as THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial, THREE.Object3DEventMap> | undefined


        if (newSlot && !slots.includes(newSlot.name as slots_id)) {
            if (newHoveredSlot !== null) {
                if (newHoveredSlot.userData.isCanceled === true) {
                    newHoveredSlot.material.color.set(0.1, 0.1, 0.1)
                } else {
                    newHoveredSlot.material.color.set(0xffffff)
                }
                newHoveredSlot = null
            }
        }

        if (newSlot && slots.includes(newSlot.name as slots_id)) {
            const color = new THREE.Color(getAttributColor(attribut))

            if (newHoveredSlot !== null && newHoveredSlot !== newSlot && slots.includes(newSlot.name as slots_id)) {
                if (newHoveredSlot.userData.isCanceled === true) {
                    newHoveredSlot.material.color.set(0.1, 0.1, 0.1)
                } else {
                    newHoveredSlot.material.color.set('white')
                }
                newHoveredSlot = newSlot as THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial, THREE.Object3DEventMap>
                newSlot.material.color.set(color)

            } else if (!newHoveredSlot && slots.includes(newSlot.name as slots_id)) {
                newHoveredSlot = newSlot as THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial, THREE.Object3DEventMap>
                newSlot.material.color.set(color)

            } else if (newHoveredSlot && slots.includes(newSlot.name as slots_id) === false) {
                if (newHoveredSlot.userData.isCanceled === true) {
                    newHoveredSlot.material.color.set(0.1, 0.1, 0.1)
                } else {
                    newHoveredSlot.material.color.set('white')
                }
                newHoveredSlot = null
            }
        }

    }

    return newHoveredSlot

}