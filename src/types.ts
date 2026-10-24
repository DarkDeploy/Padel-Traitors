export type Role = 'faithful' | 'traitor';

export interface Player {
  id: string;
  name: string;
  /** Inactive players are kept (with their history) but sit out of rounds. */
  active: boolean;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  instructions: string[];
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
  version: 1;
  phase: Phase;
  players: Player[];
  traitorCount: number;
  completedRounds: number;
  history: TraitorHistory;
  /** Traitors from the last completed round. */
  previousTraitorIds: string[];
  /** Mission from the last completed round. */
  previousMissionId: string | null;
  current: CurrentRound | null;
}
