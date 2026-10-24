import { AllocationError, recordRound, selectTraitors, validateConfig } from './allocation';
import { cryptoRandomInt, type RandomInt } from './random';
import { seededRandomInt } from './test/seeded';
import type { TraitorHistory } from './types';

const ids = (n: number) => Array.from({ length: n }, (_, i) => `p${i}`);

interface SimState {
  history: TraitorHistory;
  previous: string[];
  consecutive: number;
}

const newState = (): SimState => ({ history: {}, previous: [], consecutive: 0 });

function playRounds(state: SimState, playerIds: string[], traitorCount: number, rounds: number, rng: RandomInt) {
  for (let r = 0; r < rounds; r++) {
    const traitors = selectTraitors(
      { playerIds, traitorCount, history: state.history, previousTraitorIds: state.previous },
      rng,
    );
    expect(traitors).toHaveLength(traitorCount);
    expect(new Set(traitors).size).toBe(traitorCount);
    traitors.forEach((id) => expect(playerIds).toContain(id));
    state.consecutive += traitors.filter((id) => state.previous.includes(id)).length;
    state.history = recordRound(state.history, playerIds, traitors);
    state.previous = traitors;
  }
  return state;
}

const counts = (state: SimState, playerIds: string[]) => playerIds.map((id) => state.history[id]?.timesTraitor ?? 0);

describe('validateConfig', () => {
  it('rejects invalid configurations', () => {
    expect(validateConfig(0, 1)).not.toBeNull();
    expect(validateConfig(1, 1)).not.toBeNull();
    expect(validateConfig(4, 0)).not.toBeNull();
    expect(validateConfig(4, 4)).not.toBeNull();
    expect(validateConfig(4, 1.5)).not.toBeNull();
    expect(validateConfig(2, 1)).toBeNull();
    expect(validateConfig(4, 3)).toBeNull();
  });
});

describe('selectTraitors', () => {
  it('throws on invalid input', () => {
    const base = { history: {}, previousTraitorIds: [] };
    expect(() => selectTraitors({ ...base, playerIds: ['a'], traitorCount: 1 })).toThrow(AllocationError);
    expect(() => selectTraitors({ ...base, playerIds: ['a', 'b'], traitorCount: 2 })).toThrow(AllocationError);
    expect(() => selectTraitors({ ...base, playerIds: ['a', 'b'], traitorCount: 0 })).toThrow(AllocationError);
    expect(() => selectTraitors({ ...base, playerIds: ['a', 'a', 'b'], traitorCount: 1 })).toThrow(AllocationError);
  });

  it('assigns exactly the configured number of unique Traitors every round', () => {
    for (let n = 2; n <= 12; n++) {
      for (let k = 1; k < n; k++) {
        playRounds(newState(), ids(n), k, 15, seededRandomInt(n * 100 + k));
      }
    }
  });

  it('keeps cumulative Traitor counts within one of each other over many rounds', () => {
    for (const [n, k] of [[4, 1], [5, 1], [6, 2], [7, 2], [8, 3], [3, 2], [5, 4]]) {
      const playerIds = ids(n);
      const state = newState();
      for (let r = 0; r < 60; r++) {
        playRounds(state, playerIds, k, 1, seededRandomInt(r + n * 31 + k));
        const c = counts(state, playerIds);
        expect(Math.max(...c) - Math.min(...c)).toBeLessThanOrEqual(1);
      }
    }
  });

  it('never makes someone a Traitor in consecutive rounds when there are enough other players', () => {
    for (const [n, k] of [[2, 1], [4, 1], [4, 2], [6, 3], [7, 2], [10, 3], [10, 5]]) {
      for (let seed = 0; seed < 10; seed++) {
        const state = playRounds(newState(), ids(n), k, 40, seededRandomInt(seed));
        expect(state.consecutive).toBe(0);
      }
    }
  });

  it('only repeats Traitors when it is unavoidable, and then as few as possible', () => {
    // 3 players, 2 Traitors: at least one repeat each round after the first.
    const state = playRounds(newState(), ids(3), 2, 30, seededRandomInt(7));
    expect(state.consecutive).toBe(29);
  });

  it('gives a newly joined player a fair share instead of a run of Traitor rounds', () => {
    const state = newState();
    const original = ids(4);
    playRounds(state, original, 1, 9, seededRandomInt(1));
    const withNewcomer = [...original, 'new'];
    const before = state.history;
    playRounds(state, withNewcomer, 1, 10, seededRandomInt(2));
    // Over 10 rounds of 5 players and 1 Traitor the newcomer's fair share is 2.
    expect(state.history.new.timesTraitor).toBeGreaterThanOrEqual(1);
    expect(state.history.new.timesTraitor).toBeLessThanOrEqual(3);
    for (const id of withNewcomer) {
      const h = state.history[id];
      expect(Math.abs(h.timesTraitor - h.fairShare)).toBeLessThanOrEqual(1);
    }
    expect(before).not.toBe(state.history);
  });

  it('handles players leaving and returning', () => {
    const state = newState();
    const all = ids(6);
    playRounds(state, all, 1, 6, seededRandomInt(3));
    playRounds(state, all.slice(0, 4), 1, 8, seededRandomInt(4)); // p4, p5 sit out
    playRounds(state, all, 1, 12, seededRandomInt(5));
    for (const id of all) {
      const h = state.history[id];
      expect(Math.abs(h.timesTraitor - h.fairShare)).toBeLessThanOrEqual(1);
    }
    expect(state.history.p4.roundsPlayed).toBe(18);
  });

  it('stays balanced when the Traitor count changes', () => {
    const state = newState();
    const playerIds = ids(8);
    playRounds(state, playerIds, 1, 5, seededRandomInt(8));
    playRounds(state, playerIds, 3, 7, seededRandomInt(9));
    playRounds(state, playerIds, 2, 6, seededRandomInt(10));
    for (const id of playerIds) {
      const h = state.history[id];
      expect(Math.abs(h.timesTraitor - h.fairShare)).toBeLessThanOrEqual(1);
    }
    const c = counts(state, playerIds);
    expect(c.reduce((a, b) => a + b, 0)).toBe(5 + 21 + 12);
  });

  it('chooses uniformly at random among equally eligible players', () => {
    const playerIds = ids(4);
    const tally: Record<string, number> = {};
    const trials = 4000;
    for (let i = 0; i < trials; i++) {
      const [id] = selectTraitors({ playerIds, traitorCount: 1, history: {}, previousTraitorIds: [] }, cryptoRandomInt);
      tally[id] = (tally[id] ?? 0) + 1;
    }
    for (const id of playerIds) {
      // Expected 1000 each; 5+ standard deviations of slack.
      expect(tally[id]).toBeGreaterThan(850);
      expect(tally[id]).toBeLessThan(1150);
    }
  });

  it('does not simply take players in list order', () => {
    const playerIds = ids(6);
    const firsts = new Set<string>();
    for (let seed = 0; seed < 30; seed++) {
      firsts.add(
        selectTraitors({ playerIds, traitorCount: 1, history: {}, previousTraitorIds: [] }, seededRandomInt(seed))[0],
      );
    }
    expect(firsts.size).toBeGreaterThan(3);
  });

  it('prefers players who have been Traitor fewer times', () => {
    const history: TraitorHistory = {
      a: { timesTraitor: 3, fairShare: 2, roundsPlayed: 6 },
      b: { timesTraitor: 1, fairShare: 2, roundsPlayed: 6 },
      c: { timesTraitor: 2, fairShare: 2, roundsPlayed: 6 },
    };
    for (let seed = 0; seed < 20; seed++) {
      expect(
        selectTraitors({ playerIds: ['a', 'b', 'c'], traitorCount: 1, history, previousTraitorIds: [] }, seededRandomInt(seed)),
      ).toEqual(['b']);
    }
  });
});

describe('recordRound', () => {
  it('updates counts and fair shares for participating players only', () => {
    const history = recordRound({ x: { timesTraitor: 1, fairShare: 1, roundsPlayed: 3 } }, ['a', 'b', 'c', 'd'], ['b']);
    expect(history.b).toEqual({ timesTraitor: 1, fairShare: 0.25, roundsPlayed: 1 });
    expect(history.a).toEqual({ timesTraitor: 0, fairShare: 0.25, roundsPlayed: 1 });
    expect(history.x).toEqual({ timesTraitor: 1, fairShare: 1, roundsPlayed: 3 });
  });
});
