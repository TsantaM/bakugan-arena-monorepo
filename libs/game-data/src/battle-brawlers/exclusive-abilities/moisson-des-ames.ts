import { PowerChange } from "../../function/ability-cards-effects/power-change.js"
import { AbilityCardFailed } from "../../function/create-animation-directives/ability-card-failed.js"
import { CustomAnimationDirective } from "../../function/create-animation-directives/custom-animation.js"
import { NewAdditionnalMessage } from "../../function/new-additional-message.js"
import { Bakugans } from "../bakugans.js"
import { exclusiveAbilitiesType } from "../../type/game-data-types.js"
import type { activateAbilities, stateType } from "../../type/room-types.js"
import { countEliminated, getCaster, isInActiveBattle } from "./helpers.js"

/** Puissance moissonnee par bakugan allie elimine. */
const POWER_PER_FALLEN_ALLY = 100
/** Puissance moissonnee par bakugan adverse elimine. */
const POWER_PER_FALLEN_OPPONENT = 50

/** Prefixe du montant courant note dans l'enregistrement persistant. */
const APPLIED_PREFIX = 'applied:'

/**
 * La carte doit pouvoir reprendre exactement ce qu'elle a donne, alors que le
 * montant change a chaque fois que Reaper revient sur le terrain. On tient donc
 * un compteur dans l'enregistrement persistant, `fusion` servant de bloc-notes.
 */
function readApplied(record: activateAbilities): number {
    const entry = record.fusion?.find((f) => f.startsWith(APPLIED_PREFIX))
    if (!entry) return 0

    const amount = Number(entry.slice(APPLIED_PREFIX.length))
    return Number.isFinite(amount) ? amount : 0
}

function writeApplied(record: activateAbilities, amount: number) {
    const others = (record.fusion ?? []).filter((f) => !f.startsWith(APPLIED_PREFIX))
    record.fusion = [...others, `${APPLIED_PREFIX}${amount}`]
}

/** L'enregistrement persistant de cette carte pour un lanceur donne. */
function findRecord(roomState: stateType, userId: string, bakuganKey: string) {
    return [...roomState.persistantAbilities]
        .reverse()
        .find(
            (a) =>
                a.key === MoissonDesAmes.key &&
                !a.canceled &&
                a.userId === userId &&
                a.bakuganKey === bakuganKey,
        )
}

/** Puissance tiree des seuls allies tombes : la part qui survit aux retours en main. */
function allyHarvest(roomState: stateType, userId: string): number {
    return countEliminated(roomState, userId) * POWER_PER_FALLEN_ALLY
}

/** Puissance tiree des adverses tombes : accordee une seule fois, a l'activation. */
function opponentHarvest(roomState: stateType, userId: string): number {
    const opponentId = roomState.decksState.find((d) => d.userId !== userId)?.userId
    if (!opponentId) return 0

    return countEliminated(roomState, opponentId) * POWER_PER_FALLEN_OPPONENT
}

/**
 * Moisson des Ames — Darkus Reaper.
 *
 * Le Faucheur se nourrit du cimetiere : +100 Gs par bakugan allie elimine,
 * +50 Gs par bakugan adverse elimine.
 *
 * La part venant des allies est **persistante**. Si Reaper quitte le terrain et
 * y revient, il repart de sa puissance de base (le deck ne conserve aucun gain)
 * mais `onUserSet` lui rend aussitot la moisson de ses propres morts, recalculee
 * sur le cimetiere du moment. La part arrachee a l'adversaire, elle, ne revient
 * pas : elle etait le butin d'une seule fauche.
 *
 * C'est le pendant sombre des Griffes Affamees de Fear Ripper : celles-ci
 * recompensent celui qui frappe, celle-ci recompense celui qui enterre — et elle
 * est la seule carte du jeu dont le bonus se reconstruit tout seul.
 */
export const MoissonDesAmes: exclusiveAbilitiesType = {
    key: 'moisson-des-ames',
    maxInDeck: 1,
    usable_in_neutral: false,
    usable_if_user_not_on_domain: false,
    attribut: 'Darkus',
    onActivate({ roomState, userId, bakuganKey, slot }) {
        const animation = AbilityCardFailed({ abilityKey: MoissonDesAmes.key })
        if (!roomState) return animation

        const caster = getCaster({ roomState, slot, bakuganKey, userId })
        if (!caster) return animation

        const fromAllies = allyHarvest(roomState, userId)
        const fromOpponents = opponentHarvest(roomState, userId)
        const total = fromAllies + fromOpponents

        // Cimetiere vide : rien a moissonner.
        if (total <= 0) return animation

        const abilities = roomState.persistantAbilities
        const lastId = abilities.length > 0 ? abilities[abilities.length - 1].id : 0

        const record: activateAbilities = {
            id: lastId + 1,
            key: MoissonDesAmes.key,
            bakuganKey,
            userId,
            canceled: false,
        }

        writeApplied(record, total)
        abilities.push(record)

        CustomAnimationDirective({
            roomState,
            animationKey: MoissonDesAmes.key,
            sourceBakugan: caster.user,
            slotId: slot,
            payload: {
                power: total,
                fromAllies,
                fromOpponents,
                fallenAllies: countEliminated(roomState, userId),
            },
        })

        NewAdditionnalMessage({
            roomState,
            key: 'bakugan_harvest',
            params: { name: Bakugans[caster.user.key].name, power: total },
        })

        PowerChange({ roomState, bakugan: caster.user, G: total, malus: false })

        return null
    },
    /**
     * Reaper revient sur le terrain : le serveur a deja reinscrit la capacite
     * sur le nouvel emplacement (`set-bakugan-server`), il ne reste qu'a rendre
     * la moisson — celle des allies uniquement, recalculee.
     */
    onUserSet({ roomState, bakuganKey, slot, userId }) {
        if (!roomState) return

        const record = findRecord(roomState, userId, bakuganKey)
        if (!record) return

        const caster = getCaster({ roomState, slot, bakuganKey, userId })
        if (!caster) return

        const fromAllies = allyHarvest(roomState, userId)

        // Le compteur suit la realite du terrain, meme quand il n'y a plus rien
        // a rendre : sinon une annulation reprendrait un montant fantome.
        writeApplied(record, fromAllies)
        if (fromAllies <= 0) return

        CustomAnimationDirective({
            roomState,
            animationKey: MoissonDesAmes.key,
            sourceBakugan: caster.user,
            slotId: slot,
            payload: {
                power: fromAllies,
                fromAllies,
                fromOpponents: 0,
                fallenAllies: countEliminated(roomState, userId),
                restored: true,
            },
        })

        NewAdditionnalMessage({
            roomState,
            key: 'bakugan_harvest_restored',
            params: { name: Bakugans[caster.user.key].name, power: fromAllies },
        })

        PowerChange({ roomState, bakugan: caster.user, G: fromAllies, malus: false })
    },
    onCanceled({ roomState, userId, bakuganKey, slot }) {
        if (!roomState) return

        const record = findRecord(roomState, userId, bakuganKey)
        if (!record) return

        const applied = readApplied(record)
        record.canceled = true
        writeApplied(record, 0)

        if (applied <= 0) return

        const caster = getCaster({ roomState, slot, bakuganKey, userId })
        if (!caster) return

        PowerChange({
            roomState,
            bakugan: caster.user,
            G: applied,
            malus: true,
            ignoreProtection: true,
        })
    },
    activationConditions({ roomState, userId }) {
        return allyHarvest(roomState, userId) + opponentHarvest(roomState, userId) > 0
    },
    canUse({ roomState, bakugan }) {
        return isInActiveBattle(roomState, bakugan)
    },
}
