import { Slots, type bakuganOnSlot, type portalSlotsTypeElement } from "@bakugan-arena/game-data";
import { getAttributColor } from "../functions/get-attrubut-color";
import * as THREE from "three";
import gsap from "gsap";
import { GetSpritePosition } from "../functions/get-sprite-position";

type SetBakuganAnimationProps = {
    sphere: THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial, THREE.Object3DEventMap>;
    bakuganMesh: THREE.Sprite<THREE.Object3DEventMap>;
    bakugan: bakuganOnSlot;
    camera: THREE.PerspectiveCamera;
    userId: string;
    slot: portalSlotsTypeElement;
    scene: THREE.Scene;
};

export function SetBakuganAnimation({
    bakuganMesh,
    camera,
    sphere,
    bakugan,
    userId,
    slot,
    scene,
}: SetBakuganAnimationProps): Promise<void> {
    return new Promise((resolve) => {
        const attributColor = getAttributColor(bakugan.attribut);
        const color = new THREE.Color(attributColor);

        const index = Slots.indexOf(slot.id);
        if (index === -1) return resolve();

        const position = GetSpritePosition({
            bakugan: bakugan,
            slot: slot,
            slotIndex: index,
            userId: userId,
        });
        if (!position) return resolve();

        const timeline = gsap.timeline({
            onStart: () => {
                sphere.material.visible = true;
            },
            onComplete: () => {
                scene.remove(sphere);
                resolve() // ✅ l’animation est terminée, on résout la promesse

            },
        }).timeScale(1);

        // === Animation de déplacement ===
        timeline.fromTo(
            sphere.position,
            {
                x: bakugan.userId === userId ? camera.position.x : -camera.position.x,
                y: 0.5,
                z: bakugan.userId === userId ? camera.position.z : -camera.position.z,
            },
            {
                x: position.x,
                y: 0.5,
                z: position.z,
                duration: 1,
            }
        );

        // === Animation de disparition de la sphère ===
        timeline.fromTo(
            sphere.scale,
            { x: 0.3, y: 0.3, z: 0.3 },
            { x: 0, y: 0, z: 0, duration: 0.2 }
        );

        // === Apparition du sprite Bakugan ===
        timeline.fromTo(
            bakuganMesh.scale,
            { x: 0, y: 0, z: 0 },
            { x: 2, y: 2, z: 1, duration: 1 }
        );

        // === Effet de couleur ===
        timeline.from(bakuganMesh.material.color, {
            r: color.r,
            g: color.g,
            b: color.b,
            duration: 1,
        });
    });
}
