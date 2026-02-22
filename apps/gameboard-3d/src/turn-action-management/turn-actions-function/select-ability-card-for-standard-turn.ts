import type { onBoardBakugans, SelectableGateCardAction, slots_id } from "@bakugan-arena/game-data";
import * as THREE from 'three'

export function SelectAbilityCardForStandardTurn({ data, useAbilityCard, userId, cardsToUse, card, scene, bakugans }: {
    data: SelectableGateCardAction,
    useAbilityCard: {
        type: "USE_ABILITY_CARD";
        data: {
            key: string;
            userId: string;
            bakuganId: string | "";
            slot: slots_id | "";
        } | undefined;
    },
    userId: string,
    cardsToUse: NodeListOf<Element>,
    card: Element,
    scene: THREE.Scene<THREE.Object3DEventMap>
    bakugans: onBoardBakugans[]
}) {

    if (useAbilityCard.type !== "USE_ABILITY_CARD") return

    if (useAbilityCard.data && useAbilityCard.data.key === data.key) {
        useAbilityCard.data = undefined
        cardsToUse.forEach((c) => {
            c.classList.remove('selected-card')
        })


    } else {
        useAbilityCard.data = undefined
        useAbilityCard.data = {
            key: data.key,
            userId: userId,
            bakuganId: '',
            slot: '' as slots_id
        }

        card.classList.add('selected-card')
        cardsToUse.forEach((c) => {
            if (c === card) return
            if (c.classList.contains('selected-card')) {
                c.classList.remove('selected-card')
            }
        })

    }

    if (useAbilityCard.data !== undefined) {

        bakugans.forEach((bakugan) => {

            const mesh = scene.getObjectByName(`${bakugan.bakuganKey}-${userId}`) as THREE.Sprite<THREE.Object3DEventMap>
            if (!mesh) return

            if (bakugan.abilities.some((ability) => ability.key === data.key)) {
                mesh.material.opacity = 1
            } else {
                mesh.material.transparent = true
                mesh.material.opacity = 0.5
            }

        })

    } else {
        bakugans.forEach((bakugan) => {

            const mesh = scene.getObjectByName(`${bakugan.bakuganKey}-${userId}`) as THREE.Sprite<THREE.Object3DEventMap>
            if (!mesh) return

            mesh.material.opacity = 1

        })
    }


}