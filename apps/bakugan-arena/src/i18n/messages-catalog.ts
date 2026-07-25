import type { Locale, Namespace } from '@bakugan-arena/i18n'

import en_account from '@bakugan-arena/i18n/locales/en/account.json'
import en_admin from '@bakugan-arena/i18n/locales/en/admin.json'
import en_auth from '@bakugan-arena/i18n/locales/en/auth.json'
import en_bakuDex from '@bakugan-arena/i18n/locales/en/bakuDex.json'
import en_battle from '@bakugan-arena/i18n/locales/en/battle.json'
import en_battlefield from '@bakugan-arena/i18n/locales/en/battlefield.json'
import en_common from '@bakugan-arena/i18n/locales/en/common.json'
import en_deckBuilder from '@bakugan-arena/i18n/locales/en/deckBuilder.json'
import en_gameData from '@bakugan-arena/i18n/locales/en/gameData.json'
import en_ladder from '@bakugan-arena/i18n/locales/en/ladder.json'
import en_landing from '@bakugan-arena/i18n/locales/en/landing.json'
import en_legal from '@bakugan-arena/i18n/locales/en/legal.json'
import en_lobby from '@bakugan-arena/i18n/locales/en/lobby.json'
import en_nav from '@bakugan-arena/i18n/locales/en/nav.json'
import en_patchNotes from '@bakugan-arena/i18n/locales/en/patchNotes.json'
import en_replay from '@bakugan-arena/i18n/locales/en/replay.json'
import en_thanks from '@bakugan-arena/i18n/locales/en/thanks.json'
import en_tutorial from '@bakugan-arena/i18n/locales/en/tutorial.json'
import en_ui from '@bakugan-arena/i18n/locales/en/ui.json'
import fr_account from '@bakugan-arena/i18n/locales/fr/account.json'
import fr_admin from '@bakugan-arena/i18n/locales/fr/admin.json'
import fr_auth from '@bakugan-arena/i18n/locales/fr/auth.json'
import fr_bakuDex from '@bakugan-arena/i18n/locales/fr/bakuDex.json'
import fr_battle from '@bakugan-arena/i18n/locales/fr/battle.json'
import fr_battlefield from '@bakugan-arena/i18n/locales/fr/battlefield.json'
import fr_common from '@bakugan-arena/i18n/locales/fr/common.json'
import fr_deckBuilder from '@bakugan-arena/i18n/locales/fr/deckBuilder.json'
import fr_gameData from '@bakugan-arena/i18n/locales/fr/gameData.json'
import fr_ladder from '@bakugan-arena/i18n/locales/fr/ladder.json'
import fr_landing from '@bakugan-arena/i18n/locales/fr/landing.json'
import fr_legal from '@bakugan-arena/i18n/locales/fr/legal.json'
import fr_lobby from '@bakugan-arena/i18n/locales/fr/lobby.json'
import fr_nav from '@bakugan-arena/i18n/locales/fr/nav.json'
import fr_patchNotes from '@bakugan-arena/i18n/locales/fr/patchNotes.json'
import fr_replay from '@bakugan-arena/i18n/locales/fr/replay.json'
import fr_thanks from '@bakugan-arena/i18n/locales/fr/thanks.json'
import fr_tutorial from '@bakugan-arena/i18n/locales/fr/tutorial.json'
import fr_ui from '@bakugan-arena/i18n/locales/fr/ui.json'
import ar_account from '@bakugan-arena/i18n/locales/ar/account.json'
import ar_admin from '@bakugan-arena/i18n/locales/ar/admin.json'
import ar_auth from '@bakugan-arena/i18n/locales/ar/auth.json'
import ar_bakuDex from '@bakugan-arena/i18n/locales/ar/bakuDex.json'
import ar_battle from '@bakugan-arena/i18n/locales/ar/battle.json'
import ar_battlefield from '@bakugan-arena/i18n/locales/ar/battlefield.json'
import ar_common from '@bakugan-arena/i18n/locales/ar/common.json'
import ar_deckBuilder from '@bakugan-arena/i18n/locales/ar/deckBuilder.json'
import ar_gameData from '@bakugan-arena/i18n/locales/ar/gameData.json'
import ar_ladder from '@bakugan-arena/i18n/locales/ar/ladder.json'
import ar_landing from '@bakugan-arena/i18n/locales/ar/landing.json'
import ar_legal from '@bakugan-arena/i18n/locales/ar/legal.json'
import ar_lobby from '@bakugan-arena/i18n/locales/ar/lobby.json'
import ar_nav from '@bakugan-arena/i18n/locales/ar/nav.json'
import ar_patchNotes from '@bakugan-arena/i18n/locales/ar/patchNotes.json'
import ar_replay from '@bakugan-arena/i18n/locales/ar/replay.json'
import ar_thanks from '@bakugan-arena/i18n/locales/ar/thanks.json'
import ar_tutorial from '@bakugan-arena/i18n/locales/ar/tutorial.json'
import ar_ui from '@bakugan-arena/i18n/locales/ar/ui.json'

type MessageTree = Record<string, unknown>
type LocaleCatalog = Record<Namespace, MessageTree>

const catalogs: Record<Locale, LocaleCatalog> = {
  en: {
    account: en_account as MessageTree,
    admin: en_admin as MessageTree,
    auth: en_auth as MessageTree,
    bakuDex: en_bakuDex as MessageTree,
    battle: en_battle as MessageTree,
    battlefield: en_battlefield as MessageTree,
    common: en_common as MessageTree,
    deckBuilder: en_deckBuilder as MessageTree,
    gameData: en_gameData as MessageTree,
    ladder: en_ladder as MessageTree,
    landing: en_landing as MessageTree,
    legal: en_legal as MessageTree,
    lobby: en_lobby as MessageTree,
    nav: en_nav as MessageTree,
    patchNotes: en_patchNotes as MessageTree,
    replay: en_replay as MessageTree,
    thanks: en_thanks as MessageTree,
    tutorial: en_tutorial as MessageTree,
    ui: en_ui as MessageTree,
  },
  fr: {
    account: fr_account as MessageTree,
    admin: fr_admin as MessageTree,
    auth: fr_auth as MessageTree,
    bakuDex: fr_bakuDex as MessageTree,
    battle: fr_battle as MessageTree,
    battlefield: fr_battlefield as MessageTree,
    common: fr_common as MessageTree,
    deckBuilder: fr_deckBuilder as MessageTree,
    gameData: fr_gameData as MessageTree,
    ladder: fr_ladder as MessageTree,
    landing: fr_landing as MessageTree,
    legal: fr_legal as MessageTree,
    lobby: fr_lobby as MessageTree,
    nav: fr_nav as MessageTree,
    patchNotes: fr_patchNotes as MessageTree,
    replay: fr_replay as MessageTree,
    thanks: fr_thanks as MessageTree,
    tutorial: fr_tutorial as MessageTree,
    ui: fr_ui as MessageTree,
  },
  ar: {
    account: ar_account as MessageTree,
    admin: ar_admin as MessageTree,
    auth: ar_auth as MessageTree,
    bakuDex: ar_bakuDex as MessageTree,
    battle: ar_battle as MessageTree,
    battlefield: ar_battlefield as MessageTree,
    common: ar_common as MessageTree,
    deckBuilder: ar_deckBuilder as MessageTree,
    gameData: ar_gameData as MessageTree,
    ladder: ar_ladder as MessageTree,
    landing: ar_landing as MessageTree,
    legal: ar_legal as MessageTree,
    lobby: ar_lobby as MessageTree,
    nav: ar_nav as MessageTree,
    patchNotes: ar_patchNotes as MessageTree,
    replay: ar_replay as MessageTree,
    thanks: ar_thanks as MessageTree,
    tutorial: ar_tutorial as MessageTree,
    ui: ar_ui as MessageTree,
  },
}

/** Bundled locale catalogs — static imports so Vercel/Next include JSON in the serverless bundle. */
export function getMessagesFlat(locale: Locale): Record<string, unknown> {
  return catalogs[locale] as unknown as Record<string, unknown>
}

