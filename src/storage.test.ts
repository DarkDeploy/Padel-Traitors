import * as game from './game';
import { clearSession, loadSession, parseSession, saveSession, STORAGE_KEY } from './storage';
import type { Session } from './types';

function sampleSession(): Session {
  let s = game.createSession();
  for (const name of ['A', 'B', 'C']) s = game.addPlayer(s, name).session!;
  s = game.startRound(s).session!;
  return game.revealRole(s);
}

beforeEach(() => localStorage.clear());

describe('storage', () => {
  it('reports an empty store', () => {
    expect(loadSession()).toEqual({ status: 'empty' });
  });

  it('round-trips a session, without restoring an open role card', () => {
    const s = sampleSession();
    expect(saveSession(s)).toBe(true);
    const loaded = loadSession();
    expect(loaded.status).toBe('ok');
    if (loaded.status !== 'ok') return;
    expect(loaded.session.current!.traitorIds).toEqual(s.current!.traitorIds);
    expect(loaded.session.current!.missionId).toBe(s.current!.missionId);
    expect(loaded.session.current!.revealing).toBe(false);
  });

  it.each([
    ['not JSON', '{nope'],
    ['null', 'null'],
    ['an array', '[]'],
    ['an old version', JSON.stringify({ ...game.createSession(), version: 0 })],
    ['missing players', JSON.stringify({ ...game.createSession(), players: undefined })],
    ['an unknown phase', JSON.stringify({ ...game.createSession(), phase: 'party' })],
  ])('treats %s as corrupt', (_, raw) => {
    localStorage.setItem(STORAGE_KEY, raw);
    expect(loadSession()).toEqual({ status: 'corrupt' });
  });

  it('rejects inconsistent rounds', () => {
    const s = sampleSession();
    const cur = s.current!;
    expect(parseSession({ ...s, current: { ...cur, missionId: 'gone' } })).toBeNull();
    expect(parseSession({ ...s, current: { ...cur, traitorIds: [] } })).toBeNull();
    expect(parseSession({ ...s, current: { ...cur, order: [...cur.order, 'ghost'] } })).toBeNull();
    expect(parseSession({ ...s, current: { ...cur, revealIndex: 99 } })).toBeNull();
    expect(parseSession({ ...s, phase: 'complete' })).toBeNull();
    expect(parseSession({ ...s, phase: 'setup' })).toBeNull();
  });

  it('survives storage that throws', () => {
    const broken = {
      getItem: () => {
        throw new Error('denied');
      },
      setItem: () => {
        throw new Error('full');
      },
      removeItem: () => {
        throw new Error('denied');
      },
    } as unknown as Storage;
    expect(loadSession(broken)).toEqual({ status: 'empty' });
    expect(saveSession(sampleSession(), broken)).toBe(false);
    expect(() => clearSession(broken)).not.toThrow();
  });
});
