export const enum Attribut {
  Pyrus,
  Ventus,
  Aquos,
  Subterra,
  Haos,
  Darkus
}

export type AttributType = keyof typeof Attribut;