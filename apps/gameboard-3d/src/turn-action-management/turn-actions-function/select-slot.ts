import { type slots_id } from "@bakugan-arena/game-data";
import * as THREE from 'three'
import { isMouseOverUI } from "./is-mouse-over-ui";

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

            } else if (!newHoveredSlot && slots.includes(newSlot.name as slots_id)) {
                newHoveredSlot = newSlot as THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial, THREE.Object3DEventMap>
                newSlot.visible = true

            } else if (newHoveredSlot && slots.includes(newSlot.name as slots_id) === false) {
                newHoveredSlot.visible = false
                newHoveredSlot = null
            }

            newSlot.visible = true

        }
    }

    return newHoveredSlot

}
