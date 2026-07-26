import type {
    ActivePlayerActionRequestType,
    InactivePlayerActionRequestType,
} from '../type/actions-serveur-requests.js'
import type { TurnActionCommitPayload } from '../type/iframe-messages.js'

/** Pré-validation client d'un coup contre le turn-action-request courant. */
export function isTurnActionLegal(
    request: ActivePlayerActionRequestType | InactivePlayerActionRequestType | null,
    commit: TurnActionCommitPayload,
): boolean {
    if (!request) return false

    const merged = [
        request.actions.mustDo,
        request.actions.mustDoOne,
        request.actions.optional,
    ].flat()

    switch (commit.actionType) {
        case 'SET_GATE_CARD_ACTION': {
            const action = merged.find((a) => a.type === 'SET_GATE_CARD_ACTION')
            if (!action || action.type !== 'SET_GATE_CARD_ACTION') return false
            const card = action.data.cards.find((c) => c.key === commit.gateId)
            if (!card) return false
            if (commit.slot && !action.data.slots.includes(commit.slot)) return false
            return true
        }
        case 'SELECT_GATE_CARD': {
            const action = merged.find((a) => a.type === 'SELECT_GATE_CARD')
            if (!action || action.type !== 'SELECT_GATE_CARD') return false
            return action.data.some((c) => c.key === commit.gateId)
        }
        case 'SET_BAKUGAN': {
            const action = merged.find((a) => a.type === 'SET_BAKUGAN')
            if (!action || action.type !== 'SET_BAKUGAN') return false
            const bakugan = action.data.bakugans.find((b) => b.key === commit.bakuganKey)
            if (!bakugan) return false
            return action.data.setableSlots.includes(commit.slot)
        }
        case 'USE_ABILITY_CARD': {
            const action = merged.find((a) => a.type === 'USE_ABILITY_CARD')
            if (!action || action.type !== 'USE_ABILITY_CARD') return false
            const bakugan = action.data.find((b) => b.bakuganKey === commit.bakuganKey)
            if (!bakugan) return false
            if (bakugan.slot !== commit.slot) return false
            return bakugan.abilities.some((a) => a.key === commit.abilityId)
        }
        case 'OPEN_GATE_CARD': {
            const action = merged.find((a) => a.type === 'OPEN_GATE_CARD')
            if (!action || action.type !== 'OPEN_GATE_CARD') return false
            return action.gateId === commit.gateId && action.slot === commit.slot
        }
        case 'ACTIVE_GATE_CARD': {
            const action = merged.find((a) => a.type === 'ACTIVE_GATE_CARD')
            if (!action || action.type !== 'ACTIVE_GATE_CARD') return false
            return (
                action.data.portalCard?.key === commit.gateId &&
                action.data.id === commit.slot
            )
        }
        case 'CHANGE_ATTRIBUTE': {
            const action = merged.find((a) => a.type === 'CHANGE_ATTRIBUTE')
            if (!action || action.type !== 'CHANGE_ATTRIBUTE') return false
            const entry = action.data.find(
                (e) =>
                    e.target.key === commit.bakugan.key &&
                    e.target.userId === commit.bakugan.userId &&
                    e.target.slot_id === commit.bakugan.slot_id,
            )
            if (!entry) return false
            return entry.attributs.includes(commit.attribut)
        }
        case 'SELECT_BAKUGAN': {
            const action = merged.find((a) => a.type === 'SELECT_BAKUGAN')
            if (!action || action.type !== 'SELECT_BAKUGAN') return false
            return action.data.some((b) => b.key === commit.key)
        }
        case 'SELECT_ABILITY_CARD': {
            const action = merged.find((a) => a.type === 'SELECT_ABILITY_CARD')
            if (!action || action.type !== 'SELECT_ABILITY_CARD') return false
            return action.data.some((c) => c.key === commit.key)
        }
        default:
            return false
    }
}
