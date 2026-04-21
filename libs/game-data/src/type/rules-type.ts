export type Formats = 'BATTLE_BRAWLERS_S1'

export type BannedCompos = {
    bakugans: string[],
    abilities: string[],
    exclusives: string[],
    gates: string[]
}

export type Rules = {
    format: Formats,
    bannedBakugans: string[],
    bannedGates: string[]
    bannedAbilities: string[],
    bannedExclusives: string[],
    bannedCompos: BannedCompos[]
}

export type GetDeckDataType = {
    id: string;
    name: string;
    bakugans: string[];
    ability: string[];
    exclusiveAbilities: string[];
    gateCards: string[];
}