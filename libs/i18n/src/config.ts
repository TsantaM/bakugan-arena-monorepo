export const locales = ['en', 'fr'] as const

export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = 'en'

/** Locales that should render with dir="rtl" (Arabic disabled for now) */
export const rtlLocales = [] as const satisfies readonly Locale[]

export type RtlLocale = (typeof rtlLocales)[number]

export const namespaces = [
  'common',
  'nav',
  'landing',
  'auth',
  'account',
  'lobby',
  'deckBuilder',
  'bakuDex',
  'ladder',
  'battlefield',
  'battle',
  'replay',
  'tutorial',
  'admin',
  'patchNotes',
  'ui',
] as const

export type Namespace = (typeof namespaces)[number]

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value)
}

export function isRtlLocale(locale: Locale): boolean {
  return (rtlLocales as readonly string[]).includes(locale)
}

export function getTextDirection(locale: Locale): 'ltr' | 'rtl' {
  return isRtlLocale(locale) ? 'rtl' : 'ltr'
}
