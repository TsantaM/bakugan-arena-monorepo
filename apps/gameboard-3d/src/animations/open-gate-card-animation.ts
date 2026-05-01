import { GateCardsList, type portalSlotsTypeElement } from "@bakugan-arena/game-data";
import gsap from "gsap";
import * as THREE from "three";
import { getAttributColor } from "../functions/get-attrubut-color";
import type { SlotMeshUsersData } from "../meshes/slot.mesh";
import { GetCharacterCardImage } from "../functions/get-character-card-image";

export async function OpenGateCardAnimation({
  mesh,
  slot,
}: {
  mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshStandardMaterial, THREE.Object3DEventMap>;
  slot: portalSlotsTypeElement;
}): Promise<void> {
  return new Promise((resolve) => {
    if (slot.portalCard === null) return resolve();

    const card = GateCardsList.find((c) => c.key === slot.portalCard?.key);
    if (!card) return resolve();

    const color = card.attribut
      ? new THREE.Color(getAttributColor(card.attribut))
      : new THREE.Color("white");

      const cardImage = card.imageByAttribut ? GetCharacterCardImage (card, slot) ? GetCharacterCardImage (card, slot) : card.image : card.image

    const texture = new THREE.TextureLoader().load(`./../images/cards/${cardImage ? cardImage : card.image}`);

    // Clone pour effet lumineux temporaire
    const overlay = mesh.clone();
    overlay.material.emissiveIntensity = 10;
    mesh.parent?.add(overlay);
    overlay.position.copy(mesh.position);
    const data = mesh.userData as SlotMeshUsersData
    data.cardName = card.name

    const timeline = gsap.timeline({
      onComplete: () => {
        data.state.open = true
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
