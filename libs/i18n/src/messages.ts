import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  type Locale,
  type Namespace,
  namespaces,
} from './config.js'

const require = createRequire(import.meta.url)

/** Absolute path to the package `locales/` directory (works from `src/` and `dist/`). */
export function getLocalesRoot(): string {
  return join(dirname(fileURLToPath(import.meta.url)), '..', 'locales')
}

export type Messages = Record<Namespace, Record<string, unknown>>

/**
 * Loads and merges all UI namespaces for a locale.
 * Intended for Node / Next server usage (next-intl `getRequestConfig`, etc.).
 */
export function getMessages(locale: Locale): Messages {
  const root = getLocalesRoot()
  const messages = {} as Messages

  for (const ns of namespaces) {
    messages[ns] = require(join(root, locale, `${ns}.json`)) as Record<string, unknown>
  }

  return messages
}

/**
 * Flat messages object (`common`, `nav`, … as top-level keys).
 * Convenient for next-intl when using namespace-prefixed keys like `nav.dashboard`.
 */
export function getMessagesFlat(locale: Locale): Record<string, unknown> {
  return getMessages(locale) as unknown as Record<string, unknown>
}
