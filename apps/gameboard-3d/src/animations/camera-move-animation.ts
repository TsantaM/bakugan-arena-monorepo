import * as THREE from 'three'
import gsap from 'gsap'


function MoveCamera({ camera, newPosition }: { camera: THREE.PerspectiveCamera, newPosition: THREE.Vector3 }) {

    const currentPosition = camera.position
    const timeline = gsap.timeline()

    timeline.fromTo(camera.position, {
        x: currentPosition.x,
        y: currentPosition.y,
        z: currentPosition.z
    }, {
        x: newPosition.x,
        y: newPosition.y,
        z: newPosition.z
    })


}

export {
    MoveCamera
}