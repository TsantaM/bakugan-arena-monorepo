import * as THREE from 'three'
import { getAttributColor } from '../../functions/get-attrubut-color';


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


    return selecter

}