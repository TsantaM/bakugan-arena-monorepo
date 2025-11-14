import * as THREE from 'three';
import gsap from 'gsap';
import { FontLoader, TextGeometry } from 'three/examples/jsm/Addons.js';
import type { bakuganOnSlot } from '@bakugan-arena/game-data';

// ✅ On charge la police une seule fois (à l’extérieur de la fonction)
const loader = new FontLoader();
const font = await loader.loadAsync('./../fonts/Square Metal-7_Regular.json');

export function PowerChangeAnimation({
  scene,
  bakugan,
  powerChange,
  malus = false,
  camera
}: {
  scene: THREE.Scene;
  bakugan: bakuganOnSlot;
  powerChange: number;
  malus?: boolean;
  camera: THREE.PerspectiveCamera;
}): Promise<void> {
  return new Promise((resolve) => {
    const bakuganMesh = scene.getObjectByName(`${bakugan.key}-${bakugan.userId}`);
    if (!bakuganMesh) return resolve();

    const powerChangeMesh = new THREE.Mesh(
      new TextGeometry(`${malus ? '-' : '+'}${powerChange}`, {
        font: font,
        size: 0.3,
        depth: 0.1,
        curveSegments: 0
      }),
      new THREE.MeshStandardMaterial({ color: 'white' })
    );

    bakuganMesh.add(powerChangeMesh);
    powerChangeMesh.lookAt(camera.position);

    const timeline = gsap.timeline({
      onComplete: () => {
        powerChangeMesh.removeFromParent();
        resolve(); // ✅ l’animation est terminée
      }
    }).timeScale(1.5);

    // Animation : le texte flotte vers le haut puis disparaît
    timeline.fromTo(
      powerChangeMesh.position,
      {
        x: powerChangeMesh.position.x - 0.5,
        y: powerChangeMesh.position.y
      },
      {
        y: powerChangeMesh.position.y + 0.5,
        yoyo: true,
        repeat: 1,
        duration: 0.8,
      }
    );
  });
}
