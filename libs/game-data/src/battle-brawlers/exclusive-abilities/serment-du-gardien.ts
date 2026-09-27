import { CustomAnimationDirective } from "../../function/create-animation-directives/custom-animation.js"
import { NewAdditionnalMessage } from "../../function/new-additional-message.js"
import { Bakugans } from "../bakugans.js"
import { exclusiveAbilitiesType } from "../../type/game-data-types.js"
import type { activateAbilities, bakuganOnSlot, stateType } from "../../type/room-types.js"
import { getCaster } from "./helpers.js"

/** L'enregistrement persistant de cette carte pour un lanceur donne. */
function findRecord(roomState: stateType, userId: string, bakuganKey: string) {
    return [...roomState.persistantAbilities]
        .reverse()
        .find(
            (a) =>
                a.key === SermentDuGardien.key &&
                !a.canceled &&
                a.userId === userId &&
                a.bakuganKey === bakuganKey,
        )
}

/** Les allies places sur les autres cartes portail : ceux que le serment couvre. */
function protegesOf(roomState: stateType, user: bakuganOnSlot): bakuganOnSlot[] {
    return roomState.protalSlots
        .filter((s) => s.id !== user.slot_id)
        .map((s) => s.bakugans)
        .flat()
        .filter((b) => b.userId === user.userId)
}

/** Pose le statut de garde et annonce le serment. Retourne false s'il tenait deja. */
function raiseOath({
    roomState,
    user,
}: {
    roomState: stateType
    user: bakuganOnSlot
}): boolean {
    if (user.statut.guardian) return false

    user.statut.guardian = {
        check: true,
        origin: 'ABILITY',
        key: SermentDuGardien.key,
    }

    CustomAnimationDirective({
        roomState,
        animationKey: SermentDuGardien.key,
        sourceBakugan: user,
        targetBakugans: protegesOf(roomState, user),
        slotId: user.slot_id,
    })

    NewAdditionnalMessage({
        roomState,
        key: 'bakugan_guardian_active',
        params: { name: Bakugans[user.key].name },
    })

    return true
}

/**
 * Serment du Gardien — Haos Siege.
 *
 * Siege se porte garant de tous ses allies presents sur les **autres** cartes
 * portail : chaque retrait de puissance qui les vise est encaisse par Siege a
 * leur place, ou qu'il se trouve sur le terrain.
 *
 * Le serment ne couvre volontairement pas les allies du propre emplacement de
 * Siege : la resolution d'un combat somme la puissance des bakugans presents,
 * donc deplacer une perte entre deux allies d'un meme combat ne changerait
 * strictement rien au resultat. Toute la valeur de la carte tient a ce qu'elle
 * fait sortir la perte du combat ou elle a ete infligee — un Tigrerra attaque
 * sur un autre portail conserve sa puissance, et c'est Siege, ailleurs, qui
 * paie l'addition.
 *
 * L'effet est persistant : il tient jusqu'a l'annulation de la carte, et
 * `onUserSet` le rend a Siege s'il quitte puis regagne le terrain.
 */
export const SermentDuGardien: exclusiveAbilitiesType = {
    key: 'serment-du-gardien',
    maxInDeck: 1,
    usable_in_neutral: true,
    usable_if_user_not_on_domain: false,
    attribut: 'Haos',
    onActivate({ roomState, userId, bakuganKey, slot }) {
        if (!roomState) return null

        const caster = getCaster({ roomState, slot, bakuganKey, userId })
        if (!caster) return null

        if (!raiseOath({ roomState, user: caster.user })) return null

        const abilities = roomState.persistantAbilities
        const lastId = abilities.length > 0 ? abilities[abilities.length - 1].id : 0

        const record: activateAbilities = {
            id: lastId + 1,
            key: SermentDuGardien.key,
            bakuganKey,
            userId,
            canceled: false,
        }

        abilities.push(record)

        return null
    },
    /**
     * Siege revient sur le terrain : le serveur a deja reinscrit la capacite sur
     * le nouvel emplacement (`set-bakugan-server`), il ne reste qu'a reposer le
     * statut sur la nouvelle instance — celle qui vient d'etre creee n'en porte
     * aucun.
     */
    onUserSet({ roomState, bakuganKey, slot, userId }) {
        if (!roomState) return

        const record = findRecord(roomState, userId, bakuganKey)
        if (!record) return

        const caster = getCaster({ roomState, slot, bakuganKey, userId })
        if (!caster) return

        raiseOath({ roomState, user: caster.user })
    },
    onCanceled({ roomState, userId, bakuganKey }) {
        if (!roomState) return

        const record = findRecord(roomState, userId, bakuganKey)
        if (record) record.canceled = true

        // Le porteur peut avoir change d'emplacement depuis l'activation :
        // on cherche le statut sur tout le terrain, pas sur le slot d'origine.
        roomState.protalSlots
            .map((s) => s.bakugans)
            .flat()
            .filter((b) => b.userId === userId && b.key === bakuganKey)
            .forEach((bakugan) => {
                const status = bakugan.statut.guardian
                if (!status || status.key !== SermentDuGardien.key) return

                bakugan.statut.guardian = false

                NewAdditionnalMessage({
                    roomState,
                    key: 'bakugan_guardian_ended',
                    params: { name: Bakugans[bakugan.key].name },
                })
            })
    },
    activationConditions({ roomState, userId }) {
        // Le serment est un engagement durable : il suffit que le joueur ait
        // d'autres bakugans a couvrir, sur le terrain ou encore en main.
        const deck = roomState.decksState.find((d) => d.userId === userId)
        if (!deck) return false

        return deck.bakugans.filter((b) => b && !b.bakuganData.elimined).length > 1
    },
    canUse({ bakugan }) {
        return !bakugan.statut.guardian
    },
}
