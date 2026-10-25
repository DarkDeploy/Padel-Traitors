import { recordRound, selectTraitors, validateConfig } from './allocation';
import { COURT_DARES, FAITHFUL_MISSIONS, pickMission, SIDE_DARES } from './missions';
import { createId, cryptoRandomInt, type RandomInt } from './random';
import type { Player, Role, Session, Winner } from './types';

export const MAX_NAME_LENGTH = 24;

export function createSession(): Session {
  return {
    version: 6,
    phase: 'setup',
    players: [],
    traitorCount: 1,
    completedRounds: 0,
    history: {},
    previousTraitors: [],
    previousFaithfulMissionId: null,
    previousCourtDareId: null,
    previousSideDareId: null,
    rounds: [],
    current: null,
  };
}

/** History is keyed by this, so capitalisation and surrounding spaces don't matter. */
export const normaliseName = (name: string) => name.trim().toLocaleLowerCase();

export type Result = { session: Session; error?: undefined } | { session?: undefined; error: string };

function checkName(session: Session, name: string, ignoreId?: string): string | null {
  const trimmed = name.trim();
  if (!trimmed) return 'Enter a name.';
  if (trimmed.length > MAX_NAME_LENGTH) return `Names can be at most ${MAX_NAME_LENGTH} characters.`;
  const key = normaliseName(trimmed);
  if (session.players.some((p) => p.id !== ignoreId && normaliseName(p.name) === key)) {
    return `${trimmed} is already playing.`;
  }
  return null;
}

const inSetup = (session: Session) => session.phase === 'setup';

export function addPlayer(session: Session, name: string, id: string = createId()): Result {
  if (!inSetup(session)) return { error: 'Return to setup to change players.' };
  const error = checkName(session, name);
  if (error) return { error };
  return { session: { ...session, players: [...session.players, { id, name: name.trim() }] } };
}

/** Renaming carries the player's Traitor history over to the new name. */
export function renamePlayer(session: Session, id: string, name: string): Result {
  if (!inSetup(session)) return { error: 'Return to setup to change players.' };
  const player = session.players.find((p) => p.id === id);
  if (!player) return { error: 'Player not found.' };
  const error = checkName(session, name, id);
  if (error) return { error };

  const from = normaliseName(player.name);
  const to = normaliseName(name);
  let { history, previousTraitors } = session;
  if (from !== to) {
    history = { ...history };
    if (history[from]) history[to] = history[from];
    else delete history[to];
    delete history[from];
    previousTraitors = previousTraitors.filter((n) => n !== to).map((n) => (n === from ? to : n));
  }
  return {
    session: {
      ...session,
      history,
      previousTraitors,
      players: session.players.map((p) => (p.id === id ? { ...p, name: name.trim() } : p)),
    },
  };
}

/** Removing a player keeps their history, so re-adding the same name picks it back up. */
export function removePlayer(session: Session, id: string): Session {
  if (!inSetup(session)) return session;
  return { ...session, players: session.players.filter((p) => p.id !== id) };
}

export function setTraitorCount(session: Session, traitorCount: number): Session {
  if (!inSetup(session)) return session;
  return { ...session, traitorCount: Math.max(1, Math.floor(traitorCount)) };
}

export function configError(session: Session): string | null {
  return validateConfig(session.players.length, session.traitorCount);
}

/** Deals a new round (first game or next game). History is only committed once every player has seen their card. */
export function startRound(session: Session, randomInt: RandomInt = cryptoRandomInt): Result {
  if (session.phase === 'dealing') return { error: 'Roles are already being dealt.' };
  const error = configError(session);
  if (error) return { error };

  const order = session.players.map((p) => p.id);
  const keyToId = new Map(session.players.map((p) => [normaliseName(p.name), p.id]));
  const faithfulMission = pickMission(FAITHFUL_MISSIONS, session.previousFaithfulMissionId, randomInt);
  const courtDare = pickMission(COURT_DARES, session.previousCourtDareId, randomInt);
  // Padel is doubles, so with more than four players someone is always sitting out.
  const sideDare = order.length > 4 ? pickMission(SIDE_DARES, session.previousSideDareId, randomInt) : null;
  const traitorKeys = selectTraitors(
    {
      playerIds: [...keyToId.keys()],
      traitorCount: session.traitorCount,
      history: session.history,
      previousTraitorIds: session.previousTraitors,
    },
    randomInt,
  );
  return {
    session: {
      ...session,
      phase: 'dealing',
      current: {
        round: session.completedRounds + 1,
        faithfulMissionId: faithfulMission.id,
        courtDareId: courtDare.id,
        sideDareId: sideDare?.id ?? null,
        order,
        traitorIds: traitorKeys.map((key) => keyToId.get(key)!),
        revealIndex: 0,
        viewed: false,
      },
    },
  };
}

/** The current player has looked at their card. */
export function markViewed(session: Session): Session {
  const { current } = session;
  if (session.phase !== 'dealing' || !current || current.viewed) return session;
  return { ...session, current: { ...current, viewed: true } };
}

/** Hands the phone to the next player; after the last player the round starts. */
export function passPhone(session: Session): Session {
  const { current } = session;
  if (session.phase !== 'dealing' || !current || !current.viewed) return session;
  const revealIndex = current.revealIndex + 1;
  const next = { ...current, viewed: false, revealIndex };
  if (revealIndex < current.order.length) return { ...session, current: next };

  const keyOf = (id: string) => normaliseName(session.players.find((p) => p.id === id)!.name);
  const traitors = current.traitorIds.map(keyOf);
  return {
    ...session,
    phase: 'playing',
    current: next,
    completedRounds: current.round,
    history: recordRound(session.history, current.order.map(keyOf), traitors),
    previousTraitors: traitors,
    previousFaithfulMissionId: current.faithfulMissionId,
    previousCourtDareId: current.courtDareId,
    previousSideDareId: current.sideDareId ?? session.previousSideDareId,
    rounds: [
      ...session.rounds,
      {
        round: current.round,
        faithfulMissionId: current.faithfulMissionId,
        courtDareId: current.courtDareId,
        sideDareId: current.sideDareId,
        traitors: current.traitorIds.map((id) => session.players.find((p) => p.id === id)!.name),
        winner: null,
      },
    ],
  };
}

/** Records who won the round just revealed (host's call). Tapping again clears it. */
export function setWinner(session: Session, winner: Winner | null): Session {
  if (session.phase !== 'revealed' || !session.current) return session;
  const round = session.current.round;
  return { ...session, rounds: session.rounds.map((r) => (r.round === round ? { ...r, winner } : r)) };
}

export function scores(session: Session): { faithful: number; traitors: number } {
  let faithful = 0;
  let traitors = 0;
  for (const r of session.rounds) {
    if (r.winner === 'faithful') faithful++;
    if (r.winner === 'traitors') traitors++;
  }
  return { faithful, traitors };
}

/** How many rounds this player has been a Traitor, including the current one. */
export function timesTraitor(session: Session, name: string): number {
  return session.history[normaliseName(name)]?.timesTraitor ?? 0;
}

/** Ends the round: the missions and the Traitors are shown to everyone. */
export function revealRound(session: Session): Session {
  if (session.phase !== 'playing') return session;
  return { ...session, phase: 'revealed' };
}

/** Back to setup. An unfinished deal is abandoned and does not count towards history. */
export function returnToSetup(session: Session): Session {
  return { ...session, phase: 'setup', current: null };
}

export function currentPlayer(session: Session): Player | undefined {
  const id = session.current?.order[session.current.revealIndex];
  return session.players.find((p) => p.id === id);
}

export function roleOf(session: Session, playerId: string): Role {
  return session.current?.traitorIds.includes(playerId) ? 'traitor' : 'faithful';
}

export function traitorNames(session: Session): string[] {
  const ids = session.current?.traitorIds ?? [];
  return session.players.filter((p) => ids.includes(p.id)).map((p) => p.name);
}
