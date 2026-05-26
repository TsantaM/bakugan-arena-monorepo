import { AnimationDirectivesTypes } from "@bakugan-arena/game-data";

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
    replay: AnimationDirectivesTypes[];
}