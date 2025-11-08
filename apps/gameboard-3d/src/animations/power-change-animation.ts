import * as THREE from 'three';
import gsap from 'gsap';
import { FontLoader, TextGeometry } from 'three/examples/jsm/Addons.js';
import type { bakuganOnSlot } from '@bakugan-arena/game-data';

const loader = new FontLoader()
const font = await loader.loadAsync('./../fonts/Square Metal-7_Regular.json');

function PowerChangeAnimation({ scene, bakugan, powerChange, malus = false, camera }: { scene: THREE.Scene, bakugan: bakuganOnSlot, powerChange: number, malus?: boolean, camera: THREE.PerspectiveCamera }) {
    const powerChangeMesh = new THREE.Mesh(
        new TextGeometry(`${malus ? '-' : '+'}${powerChange}`, {
            font: font,
            size: 0.3,
            depth: 0.1,
            curveSegments: 0
        }),
        new THREE.MeshStandardMaterial({ color: 'white'})
    )
    console.log(bakugan)
    const bakuganMesh = scene.getObjectByName(`${bakugan.key}-${bakugan.userId}`);
    console.log(bakuganMesh)
    if (!bakuganMesh) return;
    // const position = bakuganMesh.position
    console.log('Adding power change mesh at position:', bakugan);
    bakuganMesh.add(powerChangeMesh)
    powerChangeMesh.lookAt(camera.position)

    const timeline = gsap.timeline()

    timeline.fromTo(powerChangeMesh.position, {
        x: powerChangeMesh.position.x - 0.5,
        y: powerChangeMesh.position.y
    }, {
        y: powerChangeMesh.position.y + 0.5,
        yoyo: true,
        repeat: 1,
        onComplete: () => {
            powerChangeMesh.removeFromParent();
        }
    })

    return timeline;

}

export {
    PowerChangeAnimation
}