import { GateCardsList, type MessageFromIframe, type portalSlotsTypeElement } from "@bakugan-arena/game-data";
import gsap from "gsap";
import * as THREE from "three";
import { getAttributColor } from "../functions/get-attrubut-color";

export function OpenGateCardAnimation({
  mesh,
  slot,
}: {
  mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshStandardMaterial, THREE.Object3DEventMap>;
  slot: portalSlotsTypeElement;
}): Promise<void> {
  return new Promise((resolve) => {
    if (slot.portalCard === null) return resolve();

    const cardData = GateCardsList.find((c) => c.key === slot.portalCard?.key);
    if (!cardData) return resolve();

    const color = cardData.attribut
      ? new THREE.Color(getAttributColor(cardData.attribut))
      : new THREE.Color("white");

    const texture = new THREE.TextureLoader().load(`./../images/cards/${cardData.image}`);

    // Clone pour effet lumineux temporaire
    const overlay = mesh.clone();
    overlay.material.emissiveIntensity = 10;
    mesh.parent?.add(overlay);
    overlay.position.copy(mesh.position);
    mesh.userData.cardName = cardData.name

    const timeline = gsap.timeline({
      onComplete: () => {
        const message: MessageFromIframe = {
          type: "ANIMATION_DONE",
        };
        window.parent.postMessage(message, "http://localhost:3000/");
        resolve(); // ✅ Promesse résolue à la fin de l’animation
      },
    });

    // Phase 1 : éclair lumineux coloré
    timeline.to(overlay.material.emissive, {
      r: color.r,
      g: color.g,
      b: color.b,
      duration: 1,
      onComplete: () => {
        // Changement de texture (la carte s’ouvre)
        mesh.material.map = texture;
        gsap.fromTo(
          mesh.material.color,
          { r: 0, g: 0, b: 0 },
          { r: 1, g: 1, b: 1, duration: 0.5 }
        );
      },
    });

    // Phase 2 : disparition du halo lumineux
    timeline.to(overlay.material.emissive, {
      r: 0,
      g: 0,
      b: 0,
      duration: 1,
      onComplete: () => {
        overlay.removeFromParent();
      },
    });
  });
}
