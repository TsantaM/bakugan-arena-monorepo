import enBattle from '#locales/en/battle.json' with { type: 'json' }
import frBattle from '#locales/fr/battle.json' with { type: 'json' }
import { defaultLocale, isLocale, type Locale } from './config.js'

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

/**
 * Resolves a battle message for display.
 * - If `key` is set, translate via `locales/{locale}/battle.json` (fallback EN).
 * - Otherwise use `text` (legacy replays, chat, game-data passthrough).
 */
export function resolveBattleMessage(
  message: BattleMessageInput,
  locale: string = defaultLocale,
): string {
  const loc: Locale = isLocale(locale) ? locale : defaultLocale

  if (message.key) {
    const template =
      battleCatalogs[loc][message.key] ?? battleCatalogs[defaultLocale][message.key]
    if (template) {
      return interpolate(template, message.params)
    }
  }

  return message.text ?? ''
}
