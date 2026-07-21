import { defaultLocale, isLocale, type Locale } from '@bakugan-arena/i18n'

let currentLocale: Locale = defaultLocale

export function setGameboardLocale(locale: string | null | undefined) {
  currentLocale = locale && isLocale(locale) ? locale : defaultLocale
}

export function getGameboardLocale(): Locale {
  return currentLocale
}

/** Read `locale` from the page URL (default: en). */
export function initGameboardLocaleFromUrl() {
  const params = new URLSearchParams(window.location.search)
  setGameboardLocale(params.get('locale'))
}
