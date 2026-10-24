import * as game from './game';
import { seededRandomInt } from './test/seeded';
import type { Session } from './types';

function withPlayers(names: string[]): Session {
  let s = game.createSession();
  names.forEach((name, i) => {
    s = game.addPlayer(s, name, `id${i}`).session!;
  });
  return s;
}

function dealAll(s: Session): Session {
  while (s.phase === 'dealing') s = game.passPhone(game.markViewed(s));
  return s;
}

describe('player management', () => {
  it('rejects blank and duplicate names, ignoring case and surrounding whitespace', () => {
    const s = withPlayers(['Alex']);
    expect(game.addPlayer(s, '   ').error).toBeTruthy();
    expect(game.addPlayer(s, '  alex ').error).toMatch(/already/);
    expect(game.addPlayer(s, ' Sam ').session!.players[1].name).toBe('Sam');
  });

  it('renames and removes players', () => {
    let s = withPlayers(['Alex', 'Sam']);
    expect(game.renamePlayer(s, 'id0', 'SAM').error).toBeTruthy();
    expect(game.renamePlayer(s, 'id0', ' alex ').session!.players[0].name).toBe('alex');
    s = game.removePlayer(s, 'id0');
    expect(s.players.map((p) => p.name)).toEqual(['Sam']);
  });

  it('locks players and Traitor count while dealing', () => {
    const s = game.startRound(withPlayers(['A', 'B', 'C']), seededRandomInt(1)).session!;
    expect(game.addPlayer(s, 'D').error).toBeTruthy();
    expect(game.removePlayer(s, 'id0')).toBe(s);
    expect(game.setTraitorCount(s, 2)).toBe(s);
  });
});

describe('rounds', () => {
  it('validates configuration before dealing', () => {
    expect(game.startRound(withPlayers(['A'])).error).toBeTruthy();
    const s = game.setTraitorCount(withPlayers(['A', 'B']), 2);
    expect(game.startRound(s).error).toMatch(/Faithful/);
  });

  it('cannot deal twice', () => {
    const s = game.startRound(withPlayers(['A', 'B', 'C'])).session!;
    expect(game.startRound(s).error).toBeTruthy();
  });

  it('reveals and hides each player in order, then completes', () => {
    let s = game.startRound(withPlayers(['A', 'B', 'C']), seededRandomInt(2)).session!;
    expect(s.current!.round).toBe(1);
    expect(game.currentPlayer(s)!.name).toBe('A');
    expect(game.passPhone(s)).toBe(s); // can't pass before looking
    s = game.markViewed(s);
    expect(s.current!.viewed).toBe(true);
    expect(game.markViewed(s)).toBe(s);
    s = game.passPhone(s);
    expect(s.current!.viewed).toBe(false);
    expect(game.passPhone(s)).toBe(s); // repeated tap does not skip the next player
    expect(game.currentPlayer(s)!.name).toBe('B');
    s = dealAll(s);
    expect(s.phase).toBe('playing');
    expect(s.completedRounds).toBe(1);
    const traitorName = s.players.find((p) => p.id === s.current!.traitorIds[0])!.name;
    expect(s.previousTraitors).toEqual([game.normaliseName(traitorName)]);
    expect(Object.values(s.history).reduce((n, h) => n + h.timesTraitor, 0)).toBe(1);
  });

  it('starts the next round with the same players, new mission and preserved history', () => {
    let s = dealAll(game.startRound(withPlayers(['A', 'B', 'C', 'D']), seededRandomInt(3)).session!);
    const firstMission = s.current!.faithfulMissionId;
    const firstTraitors = s.current!.traitorIds;
    expect(game.startRound(game.revealRound(s), seededRandomInt(4)).session).toBeDefined();
    s = game.startRound(s, seededRandomInt(4)).session!;
    expect(s.phase).toBe('dealing');
    expect(s.current!.round).toBe(2);
    expect(s.current!.revealIndex).toBe(0);
    expect(s.current!.faithfulMissionId).not.toBe(firstMission);
    expect(s.current!.traitorIds).not.toEqual(firstTraitors);
    expect(s.players).toHaveLength(4);
    s = dealAll(s);
    expect(Object.values(s.history).reduce((n, h) => n + h.timesTraitor, 0)).toBe(2);
  });

  it('deals a side dare only when someone will be sitting out', () => {
    const four = game.startRound(withPlayers(['A', 'B', 'C', 'D']), seededRandomInt(10)).session!;
    expect(four.current!.sideDareId).toBeNull();
    const five = game.startRound(withPlayers(['A', 'B', 'C', 'D', 'E']), seededRandomInt(11)).session!;
    expect(five.current!.sideDareId).not.toBeNull();
    expect(five.current!.sideDareId).not.toBe(five.current!.courtDareId);
  });

  it('avoids repeating last round\'s dares', () => {
    let s = dealAll(game.startRound(withPlayers(['A', 'B', 'C', 'D', 'E']), seededRandomInt(12)).session!);
    const { courtDareId, sideDareId } = s.current!;
    for (let seed = 0; seed < 20; seed++) {
      const next = game.startRound(s, seededRandomInt(seed)).session!;
      expect(next.current!.courtDareId).not.toBe(courtDareId);
      expect(next.current!.sideDareId).not.toBe(sideDareId);
    }
  });

  it('reveals only after everyone has their role', () => {
    let s = game.startRound(withPlayers(['A', 'B', 'C']), seededRandomInt(9)).session!;
    expect(game.revealRound(s)).toBe(s);
    s = game.revealRound(dealAll(s));
    expect(s.phase).toBe('revealed');
    expect(game.traitorNames(s)).toHaveLength(1);
  });

  it('does not count an abandoned deal towards history', () => {
    const base = withPlayers(['A', 'B', 'C']);
    let s = game.startRound(base, seededRandomInt(5)).session!;
    s = game.returnToSetup(game.markViewed(s));
    expect(s.phase).toBe('setup');
    expect(s.current).toBeNull();
    expect(s.history).toEqual({});
    expect(s.completedRounds).toBe(0);
  });

  it('keeps history by name when a player leaves and rejoins', () => {
    let s = dealAll(game.startRound(withPlayers(['Ana', 'Ben', 'Cal']), seededRandomInt(6)).session!);
    s = game.returnToSetup(s);
    const before = s.history.ana;
    s = game.removePlayer(s, 'id0');
    s = game.addPlayer(s, ' ANA ', 'new-id').session!;
    expect(s.history.ana).toBe(before);
    expect(before.roundsPlayed).toBe(1);
  });

  it('moves history to the new name on rename', () => {
    let s = dealAll(game.startRound(withPlayers(['Ana', 'Ben']), seededRandomInt(7)).session!);
    s = game.returnToSetup(s);
    const ana = s.history.ana;
    const wasTraitor = s.previousTraitors.includes('ana');
    s = game.renamePlayer(s, 'id0', 'Anna').session!;
    expect(s.history.anna).toBe(ana);
    expect(s.history.ana).toBeUndefined();
    expect(s.previousTraitors.includes('anna')).toBe(wasTraitor);
  });
});
