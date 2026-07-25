import { createRequire } from 'node:module'
import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  type Locale,
  type Namespace,
  namespaces,
} from './config.js'

const require = createRequire(import.meta.url)

/**
 * Absolute path to the package `locales/` directory.
 * Tries several roots so it works from `src/`, `dist/`, pnpm links, and Vercel tracing.
 */
export function getLocalesRoot(): string {
  const candidates = [
    // Prefer resolving via the installed package (pnpm / Vercel node_modules)
    (() => {
      try {
        return join(dirname(require.resolve('@bakugan-arena/i18n/package.json')), 'locales')
      } catch {
        return null
      }
    })(),
    // Relative to this module (dist/messages.js → ../locales, or src/messages.ts → ../locales)
    join(dirname(fileURLToPath(import.meta.url)), '..', 'locales'),
  ].filter((value): value is string => Boolean(value))

  for (const root of candidates) {
    if (existsSync(join(root, 'en', 'common.json'))) {
      return root
    }
  }

  throw new Error(
    `Unable to locate @bakugan-arena/i18n locales. Tried:\n${candidates.map((c) => ` - ${c}`).join('\n')}`,
  )
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
    const filePath = join(root, locale, `${ns}.json`)
    messages[ns] = require(filePath) as Record<string, unknown>
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
