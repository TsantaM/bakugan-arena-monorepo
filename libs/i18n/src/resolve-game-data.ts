import arGameData from '#locales/ar/gameData.json' with { type: 'json' }
import enGameData from '#locales/en/gameData.json' with { type: 'json' }
import frGameData from '#locales/fr/gameData.json' with { type: 'json' }
import { defaultLocale, isLocale, type Locale } from './config.js'

export type GameDataEntityKind =
  | 'bakugans'
  | 'abilities'
  | 'gates'
  | 'exclusiveAbilities'

type GameDataEntityEntry = {
  name?: string
  description?: string
}

type GameDataCatalog = Record<GameDataEntityKind, Record<string, GameDataEntityEntry>>

const gameDataCatalogs: Record<Locale, GameDataCatalog> = {
  ar: arGameData as GameDataCatalog,
  en: enGameData as GameDataCatalog,
  fr: frGameData as GameDataCatalog,
}

const abilityKinds: GameDataEntityKind[] = ['abilities', 'exclusiveAbilities']

function getEntry(
  kind: GameDataEntityKind,
  entityKey: string,
  locale: Locale,
): GameDataEntityEntry | undefined {
  return (
    gameDataCatalogs[locale]?.[kind]?.[entityKey] ??
    gameDataCatalogs[defaultLocale]?.[kind]?.[entityKey]
  )
}

function defaultFallback(
  entityKey: string,
  fallback?: { name?: string; description?: string },
): { name: string; description: string } {
  return {
    name: fallback?.name ?? entityKey,
    description: fallback?.description ?? '',
  }
}

/**
 * Resolves a game-data entity display name.
 * Falls back to English catalog, then optional game-data string, then the key.
 */
export function resolveGameDataName(
  kind: GameDataEntityKind,
  entityKey: string,
  locale: string,
  fallback: string = entityKey,
): string {
  const loc: Locale = isLocale(locale) ? locale : defaultLocale
  return getEntry(kind, entityKey, loc)?.name ?? fallback
}

/**
 * Resolves a game-data entity description.
 * Falls back to English catalog, then optional game-data string, then empty.
 */
export function resolveGameDataDescription(
  kind: GameDataEntityKind,
  entityKey: string,
  locale: string,
  fallback: string = '',
): string {
  const loc: Locale = isLocale(locale) ? locale : defaultLocale
  return getEntry(kind, entityKey, loc)?.description ?? fallback
}

/** Resolve ability / exclusive ability name + description by entity key. */
export function resolveAbilityCard(
  entityKey: string,
  locale: string,
  fallback?: { name?: string; description?: string },
): { name: string; description: string } {
  const loc: Locale = isLocale(locale) ? locale : defaultLocale
  const fb = defaultFallback(entityKey, fallback)

  for (const kind of abilityKinds) {
    const entry = getEntry(kind, entityKey, loc)
    if (entry?.name || entry?.description) {
      return {
        name: entry.name ?? fb.name,
        description: entry.description ?? fb.description,
      }
    }
  }

  return fb
}

/** Resolve a gate card name + description by entity key. */
export function resolveGateCard(
  entityKey: string,
  locale: string,
  fallback?: { name?: string; description?: string },
): { name: string; description: string } {
  const loc: Locale = isLocale(locale) ? locale : defaultLocale
  const fb = defaultFallback(entityKey, fallback)
  const entry = getEntry('gates', entityKey, loc)
  if (entry?.name || entry?.description) {
    return {
      name: entry.name ?? fb.name,
      description: entry.description ?? fb.description,
    }
  }
  return fb
}
