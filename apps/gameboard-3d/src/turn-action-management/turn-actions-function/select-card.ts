import type { SelectableGateCardAction, slots_id } from "@bakugan-arena/game-data";
import * as THREE from 'three'


export function SelectCard({ data, selectGateCard, userId, cardsToSelect, card, plane, slots }: {
    data: SelectableGateCardAction,
    selectGateCard: {
        type: "SET_GATE_CARD_ACTION";
        data: {
            key: string;
            userId: string;
            slot: slots_id | "";
        } | undefined;
    },
    userId: string,
    cardsToSelect: NodeListOf<Element>,
    card: Element,
    plane: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial, THREE.Object3DEventMap>
    slots: slots_id[]
}) {

    if (selectGateCard.data && selectGateCard.data.key === data.key) {
        selectGateCard.data = undefined
        cardsToSelect.forEach((c) => {
            c.classList.remove('selected-card')
        })


    } else {
        selectGateCard.data = undefined
        selectGateCard.data = {
            key: data.key,
            slot: '',
            userId: userId
        }

        card.classList.add('selected-card')
        cardsToSelect.forEach((c) => {
            if (c === card) return
            if (c.classList.contains('selected-card')) {
                c.classList.remove('selected-card')
            }
        })

    }

    if (selectGateCard.data === undefined || selectGateCard.data.slot === '') {

        let toRemove: THREE.Object3D[] = []

        slots.forEach((slot) => {
            plane.traverse((mesh) => {
                if (mesh.name === slot) {
                    toRemove.push(mesh)
                }
            })
        })

        toRemove.forEach((mesh) => {
            if (mesh.parent) {
                mesh.parent.remove(mesh)
            }
        })
    }

}
