import { TornadeExtreme } from "../battle-brawlers/ability-cards/ventus.js";
import { AntiMuse } from "../battle-brawlers/exclusive-abilities/anti-muse.js";
import { ForceDattraction } from "../battle-brawlers/exclusive-abilities/force-d-attraction.js";
import { ChambreDeGravite } from "../battle-brawlers/exclusive-abilities/gravity-chamber.js";
import { Marionnette } from "../battle-brawlers/exclusive-abilities/marionnette.js";
import { TrappeDeSable } from "../battle-brawlers/exclusive-abilities/trappe-de-sable.js";
import type { BannedCompos, Rules } from "../type/type-index.js";

const MoveAbilitiesBans: BannedCompos = {
    abilities: [TornadeExtreme.key],
    exclusives: [Marionnette.key, ForceDattraction.key, AntiMuse.key, ChambreDeGravite.key, TrappeDeSable.key],
    bakugans: [],
    gates: []
}

export const BBS1Rules: Rules = {
    format: "BATTLE_BRAWLERS_S1",
    bannedAbilities: [],
    bannedBakugans: [],
    bannedExclusives: [],
    bannedGates: [],
    bannedCompos: [MoveAbilitiesBans]
}