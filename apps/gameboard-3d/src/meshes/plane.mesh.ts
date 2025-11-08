import * as THREE from 'three'

const PlaneMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(12, 12),
    new THREE.MeshBasicMaterial({
        transparent: true,
        visible: false
    })
)


export {
    PlaneMesh
}