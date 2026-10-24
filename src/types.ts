export type Role = 'faithful' | 'traitor';

export interface Player {
  id: string;
  name: string;
}

/**
 * A secret mission. The same pool is used for both sides; Traitors get the
 * (usually smaller) `traitor` version because there are fewer of them.
 */
export interface Mission {
  id: string;
  title: string;
  faithful: string;
  traitor: string;
}

/** Per-player record used by the fair rotation algorithm. */
export interface PlayerHistory {
  /** Rounds this player has been a Traitor. */
  timesTraitor: number;
  /**
   * The Traitor assignments this player would have had under a perfectly even
   * split: each round played adds traitorCount / playerCount.
   */
  fairShare: number;
  roundsPlayed: number;
}

/** Keyed by normalised player name, so a player who leaves and rejoins keeps their record. */
export type TraitorHistory = Record<string, PlayerHistory>;

export interface CurrentRound {
  round: number;
  faithfulMissionId: string;
  traitorMissionId: string;
  /** Player ids in the order the phone is passed. */
  order: string[];
  traitorIds: string[];
  /** Index into `order` of the player currently holding the phone. */
  revealIndex: number;
  /** Whether the current player has looked at their card yet (enables "Done"). */
  viewed: boolean;
}

/** setup → dealing → playing → revealed → (next round) dealing … */
export type Phase = 'setup' | 'dealing' | 'playing' | 'revealed';

export interface Session {
  version: 3;
  phase: Phase;
  players: Player[];
  traitorCount: number;
  completedRounds: number;
  history: TraitorHistory;
  /** Normalised names of the Traitors from the last completed round. */
  previousTraitors: string[];
  previousFaithfulMissionId: string | null;
  previousTraitorMissionId: string | null;
  current: CurrentRound | null;
}
