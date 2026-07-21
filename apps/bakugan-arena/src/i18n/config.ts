import {
  defaultLocale,
  isLocale,
  type Locale,
} from '@bakugan-arena/i18n'

/** localStorage key — source of truth for the browser preference */
export const LOCALE_STORAGE_KEY = 'bakugan-arena-locale'

/** Cookie mirror so Server Components / next-intl can resolve the locale */
export const LOCALE_COOKIE_KEY = 'bakugan-arena-locale'

export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365

export function parseLocale(value: string | null | undefined): Locale {
  if (value && isLocale(value)) return value
  return defaultLocale
}

export { defaultLocale, type Locale }
