import { cryptoRandomInt, shuffle, type RandomInt } from './random';
import type { PlayerHistory, TraitorHistory } from './types';

/**
 * Fair Traitor rotation.
 *
 * Every player carries a running "fair share": each round they play adds
 * traitorCount / playerCount to it, i.e. the Traitor assignments they would have
 * had if roles were split perfectly evenly. A player's *excess* is
 * timesTraitor - fairShare. Each round we pick the players with the lowest
 * excess, so whoever has been under-served catches up first. Because the share
 * is per round played, this stays fair when players join, leave or sit out and
 * when the Traitor count changes; new players start at zero excess (neutral).
 *
 * Players who were Traitors last round get a penalty of one whole assignment,
 * so they are only picked again when every alternative is already more than one
 * assignment ahead of them (or there are not enough other players).
 *
 * Ties are broken uniformly at random: candidates are shuffled with
 * crypto.getRandomValues and then stably sorted by score.
 *
 * Perfect equality is not always possible (e.g. 5 players, 1 Traitor, 3 rounds);
 * this keeps every player's count within about one of their fair share.
 */

export const CONSECUTIVE_PENALTY = 1;

export class AllocationError extends Error {}

export interface AllocationInput {
  playerIds: readonly string[];
  traitorCount: number;
  history: TraitorHistory;
  previousTraitorIds: readonly string[];
}

export function validateConfig(playerCount: number, traitorCount: number): string | null {
  if (playerCount < 2) return 'Add at least two players.';
  if (!Number.isInteger(traitorCount) || traitorCount < 1) return 'There must be at least one Traitor.';
  if (traitorCount > playerCount - 1) return 'There must be at least one Faithful player.';
  return null;
}

const emptyHistory = (): PlayerHistory => ({ timesTraitor: 0, fairShare: 0, roundsPlayed: 0 });

// Scores are compared at fixed precision so floating-point noise never breaks a genuine tie.
const toScore = (value: number) => Math.round(value * 1e6);

export function selectTraitors(input: AllocationInput, randomInt: RandomInt = cryptoRandomInt): string[] {
  const { playerIds, traitorCount, history, previousTraitorIds } = input;
  if (new Set(playerIds).size !== playerIds.length) throw new AllocationError('Duplicate player ids.');
  const error = validateConfig(playerIds.length, traitorCount);
  if (error) throw new AllocationError(error);

  const previous = new Set(previousTraitorIds);
  const scored = shuffle(playerIds, randomInt).map((id) => {
    const h = history[id] ?? emptyHistory();
    const penalty = previous.has(id) ? CONSECUTIVE_PENALTY : 0;
    return { id, score: toScore(h.timesTraitor - h.fairShare + penalty) };
  });
  // Array.prototype.sort is stable, so equal scores keep their shuffled order.
  scored.sort((a, b) => a.score - b.score);
  return scored.slice(0, traitorCount).map((s) => s.id);
}

/** Returns a new history with one round recorded. */
export function recordRound(
  history: TraitorHistory,
  playerIds: readonly string[],
  traitorIds: readonly string[],
): TraitorHistory {
  const traitors = new Set(traitorIds);
  const share = traitorIds.length / playerIds.length;
  const next: TraitorHistory = { ...history };
  for (const id of playerIds) {
    const h = history[id] ?? emptyHistory();
    next[id] = {
      timesTraitor: h.timesTraitor + (traitors.has(id) ? 1 : 0),
      fairShare: h.fairShare + share,
      roundsPlayed: h.roundsPlayed + 1,
    };
  }
  return next;
}
