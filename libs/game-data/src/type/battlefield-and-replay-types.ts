import { type AnimationDirectivesTypes } from "./animations-directives.js";
import type { replayEntryType, replaySnapshotType } from "./replay-snapshot-types.js";

export type playerDataType = {
        id: string;
        image: string | null;
        displayUsername: string | null;
    } | undefined

export type player = {
    player: {
        id: string;
        image: string | null;
        displayUsername: string | null;
    };
    deck: {
        bakugans: string[];
        ability: string[];
        exclusiveAbilities: string[];
        gateCards: string[];
    };
} | undefined

export type BattleFieldPageProps = {
    player: player,
    opponent: player,
    roomId: string,
    userId: string,
    isPlayer: boolean
}

export type replayDataType = {
    roomId: string;
    player1: playerDataType;
    player2: playerDataType;
    initialSnapshot: replaySnapshotType;
    replay: replayEntryType[];
    /** @deprecated ancien format sans snapshots */
    legacyReplay?: AnimationDirectivesTypes[];
}