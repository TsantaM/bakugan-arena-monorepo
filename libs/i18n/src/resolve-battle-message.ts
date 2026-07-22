import enBattle from '#locales/en/battle.json' with { type: 'json' }
import frBattle from '#locales/fr/battle.json' with { type: 'json' }
import { defaultLocale, isLocale, type Locale } from './config.js'
import { resolveAbilityCard, resolveGateCard } from './resolve-game-data.js'

export const battleCatalogs: Record<Locale, Record<string, string>> = {
  en: enBattle,
  fr: frBattle,
}

export type BattleMessageInput = {
  key?: string
  params?: Record<string, string | number>
  text?: string
}

/** Replace `{param}` placeholders in a template string. */
export function interpolate(
  template: string,
  params?: Record<string, string | number>,
): string {
  if (!params) return template
  return template.replace(/\{(\w+)\}/g, (match, name: string) => {
    const value = params[name]
    return value !== undefined && value !== null ? String(value) : match
  })
}

function resolveParams(
  params: Record<string, string | number> | undefined,
  locale: Locale,
): Record<string, string | number> | undefined {
  if (!params) return params

  const next = { ...params }
  const hadExplicitName = params.name !== undefined

  const abilityKey = params.abilityKey
  if (typeof abilityKey === 'string') {
    const resolved = resolveAbilityCard(abilityKey, locale, {
      name: String(params.name ?? abilityKey),
      description: String(params.description ?? ''),
    })
    if (!hadExplicitName) next.name = resolved.name
    next.ability = resolved.name
    next.description = resolved.description
    if (next.source === undefined) next.source = resolved.name
  }

  const gateKey = params.gateKey
  if (typeof gateKey === 'string') {
    const resolved = resolveGateCard(gateKey, locale, {
      name: String(params.name ?? gateKey),
      description: String(params.description ?? ''),
    })
    if (!hadExplicitName && typeof abilityKey !== 'string') {
      next.name = resolved.name
    }
    next.description = resolved.description
    if (next.source === undefined) next.source = resolved.name
  }

  return next
}

/**
 * Resolves a battle message for display.
 * - If `key` is set, translate via `locales/{locale}/battle.json` (fallback EN).
 * - `ability_description` resolves from gameData catalogs via `abilityKey`.
 * - `abilityKey` in params also localizes `{name}` for ability_activate / nullify, etc.
 * - Otherwise use `text` (legacy replays, chat, untranslated passthrough).
 */
export function resolveBattleMessage(
  message: BattleMessageInput,
  locale: string = defaultLocale,
): string {
  const loc: Locale = isLocale(locale) ? locale : defaultLocale
  const params = resolveParams(message.params, loc)

  if (message.key === 'ability_description') {
    const abilityKey = params?.abilityKey
    if (typeof abilityKey === 'string') {
      return resolveAbilityCard(abilityKey, loc, {
        name: '',
        description: message.text ?? '',
      }).description
    }
    return message.text ?? ''
  }

  if (message.key === 'gate_description') {
    const gateKey = params?.gateKey
    if (typeof gateKey === 'string') {
      return resolveGateCard(gateKey, loc, {
        name: '',
        description: message.text ?? '',
      }).description
    }
    return message.text ?? ''
  }

  if (message.key) {
    const template =
      battleCatalogs[loc][message.key] ?? battleCatalogs[defaultLocale][message.key]
    if (template) {
      return interpolate(template, params)
    }
  }

  return message.text ?? ''
}
