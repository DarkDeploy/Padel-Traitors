export type Role = 'faithful' | 'traitor';

export interface Player {
  id: string;
  name: string;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
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
  missionId: string;
  /** Player ids in the order the phone is passed. */
  order: string[];
  traitorIds: string[];
  /** Index into `order` of the player currently holding the phone. */
  revealIndex: number;
  /** True while the current player's role card is showing. Never restored after a refresh. */
  revealing: boolean;
}

export type Phase = 'setup' | 'dealing' | 'complete';

export interface Session {
  version: 2;
  phase: Phase;
  players: Player[];
  traitorCount: number;
  completedRounds: number;
  history: TraitorHistory;
  /** Normalised names of the Traitors from the last completed round. */
  previousTraitors: string[];
  /** Mission from the last completed round. */
  previousMissionId: string | null;
  current: CurrentRound | null;
}
