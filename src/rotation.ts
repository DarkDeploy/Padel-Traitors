export const GAMES_PER_ROUND = 4;
const ON_COURT = 4;

/**
 * Suggested court rotation for a round: four games, one player rotates off and
 * one on each game, and the starting point carries over from the previous round
 * so nobody plays every game of every round. Only meaningful with 5+ players.
 */
export function rotation(names: readonly string[], round: number): string[][] {
  const n = names.length;
  if (n <= ON_COURT) return [];
  const offset = (round - 1) * GAMES_PER_ROUND;
  return Array.from({ length: GAMES_PER_ROUND }, (_, g) =>
    Array.from({ length: ON_COURT }, (_, i) => names[(offset + g + i) % n]),
  );
}
