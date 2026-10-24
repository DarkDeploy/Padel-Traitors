import { cryptoRandomInt, type RandomInt } from './random';
import type { Mission } from './types';

/**
 * Faithful missions. Every player (Faithful and Traitor) sees the round's mission.
 * To add one, append an entry with a unique id and add a matching Traitor task below.
 */
export const MISSIONS: Mission[] = [
  { id: 'glass-act', title: 'Glass Act', description: 'Win five points off the back glass.' },
  { id: 'rally-of-ten', title: 'Rally of Ten', description: 'Play three rallies of ten shots or more.' },
  { id: 'lob-legends', title: 'Lob Legends', description: 'Everyone wins a point with a lob.' },
  { id: 'high-five-pact', title: 'High-Five Pact', description: 'High-five your partner after every point you win.' },
  { id: 'bandeja-brigade', title: 'Bandeja Brigade', description: 'Everyone wins a point with a bandeja.' },
  { id: 'net-rush', title: 'Net Rush', description: 'The serving pair both reach the net after every serve.' },
  { id: 'compliment-club', title: 'Compliment Club', description: "Everyone compliments an opponent's shot three times." },
  { id: 'silent-score', title: 'Silent Score', description: 'Nobody says the score out loud — use fingers.' },
];

/** Secret task shown only to Traitors, kept separate from the Faithful missions. */
export const TRAITOR_TASKS: Record<string, string> = {
  'glass-act': 'Volley balls before they reach the glass.',
  'rally-of-ten': 'End long rallies with errors that look unlucky.',
  'lob-legends': 'Drift back early so lobs land short, and float your own lobs long.',
  'high-five-pact': 'Quietly skip a few high-fives.',
  'bandeja-brigade': 'Push your bandejas long or into the net on big points.',
  'net-rush': 'Find excuses to stay back after serving.',
  'compliment-club': 'Get others to forget their compliments.',
  'silent-score': 'Trick someone into saying the score.',
};

const FALLBACK_TASK = 'Make the mission fail without getting caught.';

export function getMission(id: string): Mission | undefined {
  return MISSIONS.find((m) => m.id === id);
}

export function getTraitorTask(missionId: string): string {
  return TRAITOR_TASKS[missionId] ?? FALLBACK_TASK;
}

/** Picks a random mission, avoiding the previous one when an alternative exists. */
export function selectMission(
  previousId: string | null,
  missions: readonly Mission[] = MISSIONS,
  randomInt: RandomInt = cryptoRandomInt,
): Mission {
  if (missions.length === 0) throw new Error('No missions configured.');
  const pool = missions.length > 1 ? missions.filter((m) => m.id !== previousId) : missions;
  return pool[randomInt(pool.length)];
}
