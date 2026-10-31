import { GAMES_PER_ROUND, rotation } from './rotation';

const seven = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

describe('rotation', () => {
  it('rotates one player each game', () => {
    expect(rotation(seven, 1)).toEqual([
      ['A', 'B', 'C', 'D'],
      ['B', 'C', 'D', 'E'],
      ['C', 'D', 'E', 'F'],
      ['D', 'E', 'F', 'G'],
    ]);
  });

  it('carries on from where the previous round left off', () => {
    expect(rotation(seven, 2)[0]).toEqual(['E', 'F', 'G', 'A']);
    expect(rotation(seven, 3)[0]).toEqual(['B', 'C', 'D', 'E']);
  });

  it('gives everyone the same court time over a full cycle', () => {
    const count: Record<string, number> = {};
    for (let round = 1; round <= seven.length; round++) {
      for (const game of rotation(seven, round)) for (const p of game) count[p] = (count[p] ?? 0) + 1;
    }
    expect(new Set(Object.values(count)).size).toBe(1);
    expect(count.A).toBe(GAMES_PER_ROUND * 4);
  });

  it('is not needed for four players', () => {
    expect(rotation(['A', 'B', 'C', 'D'], 1)).toEqual([]);
  });
});
