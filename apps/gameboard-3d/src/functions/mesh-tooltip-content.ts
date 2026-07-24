import { Bakugans, type onSlotStatutType } from '@bakugan-arena/game-data'
import {
    resolveAbilityCard,
    resolveBattleMessage,
    resolveGameDataName,
    resolveGateCard,
} from '@bakugan-arena/i18n'
import type { SpriteUserData } from '../meshes/bakugan.mesh'
import type { SlotMeshUsersData } from '../meshes/slot.mesh'
import { getGameboardLocale } from '../i18n/locale'

function resolveStatusSource(statut: Exclude<onSlotStatutType, false>): string {
    const locale = getGameboardLocale()
    return statut.origin === 'GATE'
        ? resolveGateCard(statut.key, locale).name
        : resolveAbilityCard(statut.key, locale).name
}

function formatStatusLine(
    key: string,
    statut: onSlotStatutType,
): string | null {
    if (!statut) return null
    return resolveBattleMessage(
        {
            key,
            params: { source: resolveStatusSource(statut) },
        },
        getGameboardLocale(),
    )
}

function emptyStatut(): SpriteUserData['statut'] {
    return {
        trapped: false,
        notRetreat: false,
        poisoned: false,
        protectedAgainstGate: false,
        protectedAgainstAbility: false,
        protected: false,
        absorbPowerBoost: false,
    }
}

function formatBakuganStatusLines(data: SpriteUserData): string[] {
    const statut = data.statut ?? emptyStatut()
    const lines: string[] = []

    const candidates: Array<{ key: string; value: onSlotStatutType }> = [
        { key: 'tooltip_status_trapped', value: statut.trapped },
        { key: 'tooltip_status_not_retreat', value: statut.notRetreat },
        { key: 'tooltip_status_poisoned', value: statut.poisoned },
        { key: 'tooltip_status_protected', value: statut.protected },
        { key: 'tooltip_status_protected_against_gate', value: statut.protectedAgainstGate },
        { key: 'tooltip_status_protected_against_ability', value: statut.protectedAgainstAbility },
        { key: 'tooltip_status_absorb', value: statut.absorbPowerBoost },
    ]

    for (const candidate of candidates) {
        const line = formatStatusLine(candidate.key, candidate.value)
        if (line) lines.push(line)
    }

    if (data.abilityBlock) {
        lines.push(
            resolveBattleMessage(
                { key: 'tooltip_status_ability_block' },
                getGameboardLocale(),
            ),
        )
    }

    if (data.assist) {
        const source =
            data.assist.addedWith === 'GATE'
                ? resolveGateCard(data.assist.key, getGameboardLocale()).name
                : resolveAbilityCard(data.assist.key, getGameboardLocale()).name
        lines.push(
            resolveBattleMessage(
                {
                    key: 'tooltip_status_assist',
                    params: { source },
                },
                getGameboardLocale(),
            ),
        )
    }

    return lines
}

function formatSlotStatusLines(state: SlotMeshUsersData['state']): string[] {
    const locale = getGameboardLocale()
    const lines: string[] = []

    if (state.open) {
        lines.push(resolveBattleMessage({ key: 'tooltip_gate_open' }, locale))
    }
    if (state.canceled) {
        lines.push(resolveBattleMessage({ key: 'tooltip_gate_canceled' }, locale))
    }
    if (state.blocked) {
        const source =
            state.blocked.blockedWith === 'GATE'
                ? resolveGateCard(state.blocked.key, locale).name
                : resolveAbilityCard(state.blocked.key, locale).name
        lines.push(
            resolveBattleMessage(
                {
                    key: 'tooltip_gate_blocked',
                    params: { source },
                },
                locale,
            ),
        )
    }

    return lines
}

function joinTooltip(title: string, statusLines: string[]): string {
    if (statusLines.length === 0) return title
    return `${title}<br/>${statusLines.map((line) => `• ${line}`).join('<br/>')}`
}

export function buildBakuganTooltipContent(data: SpriteUserData): string {
    const locale = getGameboardLocale()
    const bakuganName = resolveGameDataName(
        'bakugans',
        data.bakuganKey,
        locale,
        Bakugans[data.bakuganKey]?.name ?? data.bakuganKey,
    )
    const powerLabel = resolveBattleMessage(
        {
            key: 'tooltip_power',
            params: { power: data.powerLevel },
        },
        locale,
    )
    const title = `<strong>${bakuganName}</strong><br/>${powerLabel}`
    return joinTooltip(title, formatBakuganStatusLines(data))
}

export function buildSlotTooltipContent(data: SlotMeshUsersData): string | null {
    const statusLines = formatSlotStatusLines(data.state)
    if (!data.cardName && statusLines.length === 0) return null

    const title = data.cardName
        ? `<strong>${data.cardName}</strong>`
        : `<strong>${resolveBattleMessage({ key: 'tooltip_gate_card' }, getGameboardLocale())}</strong>`

    return joinTooltip(title, statusLines)
}
