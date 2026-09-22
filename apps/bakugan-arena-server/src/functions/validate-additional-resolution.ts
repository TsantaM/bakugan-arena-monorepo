import type {
    AbilityCardsActionsRequestsType,
    gateCardActionRequestsType,
    resolutionGateCardType,
    resolutionType,
} from "@bakugan-arena/game-data"

/**
 * Le client ne doit jamais pouvoir répondre autre chose que ce que le serveur a
 * proposé : la liste des cibles/slots construite par `onActivate` est la seule
 * source de vérité. Sans cette confrontation, tous les filtres d'offre
 * (bakugan piégé, protégé, slot sans gate, slot du lanceur…) sont contournables
 * en forgeant `resolution.data`.
 */
export function isAbilityResolutionAllowed(
    request: AbilityCardsActionsRequestsType,
    resolution: resolutionType,
): boolean {
    if (resolution.roomId !== request.roomId) return false
    if (resolution.slot !== request.slot) return false
    if (resolution.cardKey !== request.cardKey) return false
    if (resolution.bakuganKey !== request.bakuganKey) return false

    const offered = request.data
    const answer = resolution.data

    if (answer.type === "SKIP_ACTION") {
        // `CARD_FAILED` n'attend aucune réponse : passer est la seule issue
        // (c'est ce que le bot émet, et ce qui débloque la room).
        return offered.type === "CARD_FAILED" || offered.skipable === true
    }

    switch (offered.type) {
        case "SELECT_SLOT":
            return answer.type === "SELECT_SLOT" && offered.slots.includes(answer.slot)

        case "SELECT_BAKUGAN_ON_DOMAIN":
            return (
                answer.type === "SELECT_BAKUGAN_ON_DOMAIN" &&
                offered.bakugans.some(
                    (b) =>
                        b.key === answer.bakugan &&
                        b.userId === answer.userId &&
                        b.slot === answer.slot,
                )
            )

        case "ATTRACT_BAKUGAN":
            return (
                answer.type === "ATTRACT_BAKUGAN" &&
                offered.bakugans.some(
                    (b) =>
                        b.key === answer.bakugan.key &&
                        b.userId === answer.bakugan.userId &&
                        b.slot === answer.bakugan.slot,
                )
            )

        case "MOVE_BAKUGAN_TO_ANOTHER_SLOT":
            return (
                answer.type === "MOVE_BAKUGAN_TO_ANOTHER_SLOT" &&
                offered.slots.includes(answer.slot) &&
                offered.bakugans.some(
                    (b) =>
                        b.key === answer.bakugan.key &&
                        b.userId === answer.bakugan.userId,
                )
            )

        case "SELECT_BAKUGAN_TO_SET":
            return (
                answer.type === "SELECT_BAKUGAN_TO_SET" &&
                offered.bakugans.some(
                    (b) => b?.bakuganData.key === answer.bakugan?.bakuganData?.key,
                )
            )

        case "SELECT_ABILITY_CARD":
            return (
                answer.type === "SELECT_ABILITY_CARD" &&
                offered.data.some((card) => card.key === answer.card?.key)
            )

        case "CARD_FAILED":
            // Aucune réponse attendue
            return false
    }
}

export function isGateResolutionAllowed(
    request: gateCardActionRequestsType,
    resolution: resolutionGateCardType,
): boolean {
    if (resolution.roomId !== request.roomId) return false
    if (resolution.slot !== request.slot) return false
    if (resolution.cardKey !== request.cardKey) return false

    const offered = request.data
    const answer = resolution.data

    if (answer.type === "SKIP_ACTION") {
        // `TURN_ACTION_LAUNCHER` n'attend aucun choix du joueur
        if (offered.type === "TURN_ACTION_LAUNCHER") return true
        return "skipable" in offered && offered.skipable === true
    }

    switch (offered.type) {
        case "SELECT_BAKUGAN_TO_SET":
            return (
                answer.type === "SELECT_BAKUGAN_TO_SET" &&
                offered.bakugans.some(
                    (b) => b?.bakuganData.key === answer.bakugan?.bakuganData?.key,
                )
            )

        case "SELECT_ABILITY_CARD":
            return (
                answer.type === "SELECT_ABILITY_CARD" &&
                offered.data.some((card) => card.key === answer.card?.key)
            )

        default:
            return false
    }
}
