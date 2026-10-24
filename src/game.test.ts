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
  while (s.phase === 'dealing') s = game.hideAndPass(game.revealRole(s));
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
    expect(game.setPlayerActive(s, 'id0', false)).toBe(s);
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
    s = game.revealRole(s);
    expect(s.current!.revealing).toBe(true);
    expect(game.revealRole(s)).toBe(s);
    s = game.hideAndPass(s);
    expect(s.current!.revealing).toBe(false);
    expect(game.hideAndPass(s)).toBe(s); // repeated tap does not skip the next player
    expect(game.currentPlayer(s)!.name).toBe('B');
    s = dealAll(s);
    expect(s.phase).toBe('complete');
    expect(s.completedRounds).toBe(1);
    expect(s.previousTraitorIds).toEqual(s.current!.traitorIds);
    expect(Object.values(s.history).reduce((n, h) => n + h.timesTraitor, 0)).toBe(1);
  });

  it('starts the next round with the same players, new mission and preserved history', () => {
    let s = dealAll(game.startRound(withPlayers(['A', 'B', 'C', 'D']), seededRandomInt(3)).session!);
    const firstMission = s.current!.missionId;
    const firstTraitors = s.current!.traitorIds;
    s = game.startRound(s, seededRandomInt(4)).session!;
    expect(s.phase).toBe('dealing');
    expect(s.current!.round).toBe(2);
    expect(s.current!.revealIndex).toBe(0);
    expect(s.current!.missionId).not.toBe(firstMission);
    expect(s.current!.traitorIds).not.toEqual(firstTraitors);
    expect(s.players).toHaveLength(4);
    s = dealAll(s);
    expect(Object.values(s.history).reduce((n, h) => n + h.timesTraitor, 0)).toBe(2);
  });

  it('does not count an abandoned deal towards history', () => {
    const base = withPlayers(['A', 'B', 'C']);
    let s = game.startRound(base, seededRandomInt(5)).session!;
    s = game.returnToSetup(game.revealRole(s));
    expect(s.phase).toBe('setup');
    expect(s.current).toBeNull();
    expect(s.history).toEqual({});
    expect(s.completedRounds).toBe(0);
  });

  it('only deals to active players', () => {
    let s = game.setPlayerActive(withPlayers(['A', 'B', 'C']), 'id1', false);
    s = game.startRound(s).session!;
    expect(s.current!.order).toEqual(['id0', 'id2']);
  });
});
