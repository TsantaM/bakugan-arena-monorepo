import * as auth from "./schema/auth-schema.js"
import * as game from "./schema/game-schema.js"

export const schema = {
  ...auth,
  ...game,
}
