import { getMission } from './missions';
import type { CurrentRound, PlayerHistory, Session } from './types';

export const STORAGE_KEY = 'padel-traitors:session';

export type LoadResult =
  | { status: 'empty' }
  | { status: 'ok'; session: Session }
  | { status: 'corrupt' };

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const isString = (v: unknown): v is string => typeof v === 'string';
const isCount = (v: unknown): v is number => typeof v === 'number' && Number.isInteger(v) && v >= 0;
const isStringArray = (v: unknown): v is string[] => Array.isArray(v) && v.every(isString);

function isHistory(v: unknown): v is PlayerHistory {
  return (
    isObject(v) &&
    isCount(v.timesTraitor) &&
    isCount(v.roundsPlayed) &&
    typeof v.fairShare === 'number' &&
    Number.isFinite(v.fairShare) &&
    v.fairShare >= 0
  );
}

function isCurrentRound(v: unknown, playerIds: Set<string>): v is CurrentRound {
  if (!isObject(v)) return false;
  if (!isCount(v.round) || v.round < 1 || !isString(v.missionId) || !getMission(v.missionId)) return false;
  if (!isStringArray(v.order) || !isStringArray(v.traitorIds) || !isCount(v.revealIndex)) return false;
  if (typeof v.revealing !== 'boolean') return false;
  if (new Set(v.order).size !== v.order.length || !v.order.every((id) => playerIds.has(id))) return false;
  if (v.traitorIds.length < 1 || v.traitorIds.length >= v.order.length) return false;
  const order = v.order;
  if (new Set(v.traitorIds).size !== v.traitorIds.length || !v.traitorIds.every((id) => order.includes(id))) return false;
  return v.revealIndex <= v.order.length;
}

/** Validates unknown data as a Session. Returns null for anything malformed or from an older version. */
export function parseSession(data: unknown): Session | null {
  if (!isObject(data) || data.version !== 1) return null;
  const { players, history } = data;
  if (!Array.isArray(players)) return null;
  for (const p of players) {
    if (!isObject(p) || !isString(p.id) || !isString(p.name) || typeof p.active !== 'boolean') return null;
  }
  const ids = new Set(players.map((p) => p.id as string));
  if (ids.size !== players.length) return null;
  if (!isCount(data.traitorCount) || data.traitorCount < 1 || !isCount(data.completedRounds)) return null;
  if (!isObject(history) || !Object.values(history).every(isHistory)) return null;
  if (!isStringArray(data.previousTraitorIds)) return null;
  if (data.previousMissionId !== null && !isString(data.previousMissionId)) return null;

  const { phase, current } = data;
  if (phase === 'setup') {
    if (current !== null) return null;
  } else if (phase === 'dealing' || phase === 'complete') {
    if (!isCurrentRound(current, ids)) return null;
    const done = current.revealIndex === current.order.length;
    if ((phase === 'complete') !== done) return null;
  } else {
    return null;
  }

  const session = data as unknown as Session;
  // A role card is never shown again straight after a refresh; the player taps Reveal again.
  return session.current ? { ...session, current: { ...session.current, revealing: false } } : session;
}

export function loadSession(storage: Storage | undefined = safeStorage()): LoadResult {
  if (!storage) return { status: 'empty' };
  let raw: string | null;
  try {
    raw = storage.getItem(STORAGE_KEY);
  } catch {
    return { status: 'empty' };
  }
  if (raw === null) return { status: 'empty' };
  try {
    const session = parseSession(JSON.parse(raw));
    return session ? { status: 'ok', session } : { status: 'corrupt' };
  } catch {
    return { status: 'corrupt' };
  }
}

/** Returns false if the browser refused to store the session (e.g. storage disabled or full). */
export function saveSession(session: Session, storage: Storage | undefined = safeStorage()): boolean {
  if (!storage) return false;
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(session));
    return true;
  } catch {
    return false;
  }
}

export function clearSession(storage: Storage | undefined = safeStorage()): void {
  try {
    storage?.removeItem(STORAGE_KEY);
  } catch {
    // Nothing more we can do; the in-memory session is reset regardless.
  }
}

function safeStorage(): Storage | undefined {
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
}
