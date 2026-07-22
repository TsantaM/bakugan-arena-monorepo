import {
  defaultLocale,
  getTextDirection,
  isLocale,
  type Locale,
} from '@bakugan-arena/i18n'

let currentLocale: Locale = defaultLocale

function applyDocumentLocale(locale: Locale) {
  const root = document.documentElement
  root.lang = locale
  // Keep layout LTR; text direction is applied on text nodes only.
  root.dir = 'ltr'
  root.dataset.textDir = getTextDirection(locale)
}

export function setGameboardLocale(locale: string | null | undefined) {
  currentLocale = locale && isLocale(locale) ? locale : defaultLocale
  applyDocumentLocale(currentLocale)
}

export function getGameboardLocale(): Locale {
  return currentLocale
}

export function getGameboardTextDirection(): 'ltr' | 'rtl' {
  return getTextDirection(getGameboardLocale())
}

/** Apply bidi direction on a text-bearing element (not layout containers). */
export function applyTextDirection(el: HTMLElement) {
  el.dir = getGameboardTextDirection()
}

/** Read `locale` from the page URL (default: en). */
export function initGameboardLocaleFromUrl() {
  const params = new URLSearchParams(window.location.search)
  setGameboardLocale(params.get('locale'))
}
