import type { gateCardType, portalSlotsTypeElement } from "@bakugan-arena/game-data";

export function GetCharacterCardImage (card: gateCardType, slot: portalSlotsTypeElement) {

    const bakugan = slot.bakugans.find((b) => b.family === card.family)
    if(!bakugan) return card.image
    const attribut = bakugan.attribut

    if(!card.imageByAttribut) return card.image
    const image = card.imageByAttribut[attribut]
    if(!image) return card.image

    return image
}