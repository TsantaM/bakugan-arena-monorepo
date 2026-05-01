import { attribut } from "../type/type-index.js";

export function CharacterCardByAttribut(key: string, attribut: attribut) {

    const image = `caracter-gate-cards/${key.toLowerCase()}-${attribut.toLowerCase()}.jpg`

    return image
}