import { cryptoRandomInt, type RandomInt } from './random';
import type { Mission } from './types';

/**
 * Faithful missions. Every player (Faithful and Traitor) sees the round's mission.
 * To add a mission, append an entry with a unique id and, optionally, add matching
 * Traitor orders to TRAITOR_ORDERS below.
 */
export const MISSIONS: Mission[] = [
  {
    id: 'glass-act',
    title: 'Glass Act',
    description: 'Between you, win at least five points where the ball came off the back glass first.',
    instructions: [
      'Let the ball come off the back wall rather than volleying it early.',
      'Celebrate every glass winner so everyone keeps count.',
    ],
  },
  {
    id: 'rally-of-ten',
    title: 'Rally of Ten',
    description: 'Play at least three rallies of ten shots or more during the session.',
    instructions: [
      'Count shots out loud during long rallies.',
      'Choose safe, consistent shots over risky winners when a rally gets long.',
    ],
  },
  {
    id: 'lob-legends',
    title: 'Lob Legends',
    description: 'Every player must win at least one point with a lob over the net player.',
    instructions: [
      'Look for chances to lob when the opponents rush the net.',
      'Help your partner by setting up lob opportunities for them too.',
    ],
  },
  {
    id: 'high-five-pact',
    title: 'High-Five Pact',
    description: 'High-five your partner after every point your pair wins. No exceptions.',
    instructions: [
      'If a pair forgets a high-five, point it out — the group is keeping watch.',
      'Rotate partners as usual; the pact applies to everyone.',
    ],
  },
  {
    id: 'bandeja-brigade',
    title: 'Bandeja Brigade',
    description: 'Every player must win a point with a bandeja or a vibora at least once.',
    instructions: [
      'Go for controlled overheads rather than smashing everything.',
      'Call out "Bandeja!" when one wins a point so it counts.',
    ],
  },
  {
    id: 'net-rush',
    title: 'Net Rush',
    description: 'Both players on the serving pair must reach the net after every serve.',
    instructions: [
      'Serve, then move forward together as a pair.',
      'Gently remind anyone who hangs back at the baseline.',
    ],
  },
  {
    id: 'compliment-club',
    title: 'Compliment Club',
    description: 'Every player must compliment an opponent\'s shot out loud at least three times.',
    instructions: [
      'Compliments must be sincere and about a specific shot.',
      'Keep a mental note of who has and hasn\'t done theirs.',
    ],
  },
  {
    id: 'silent-score',
    title: 'Silent Score',
    description: 'Nobody may say the score out loud. Show it with your fingers instead.',
    instructions: [
      'The server holds up the score before serving.',
      'If anyone speaks the score, the group should notice and call it out.',
    ],
  },
];

/** Orders shown to every Traitor, whatever the mission. */
export const TRAITOR_BRIEFING: string[] = [
  'You know the Faithful mission. Make sure it fails — without getting caught.',
  'Look like you are trying your hardest. Suspicion is your biggest enemy.',
  'Never reveal your role, even to someone you think is a fellow Traitor.',
];

/** Extra mission-specific orders for Traitors, kept separate from the Faithful missions. */
export const TRAITOR_ORDERS: Record<string, string[]> = {
  'glass-act': ['Volley balls before they reach the glass whenever it looks natural.'],
  'rally-of-ten': ['End long rallies early with errors that look unlucky, not deliberate.'],
  'lob-legends': ['Drift back early so lobs against you fall short, and float your own lobs long.'],
  'high-five-pact': ['"Forget" the occasional high-five, then blame someone else for missing it.'],
  'bandeja-brigade': ['Push your bandejas just long or into the net when a point is on the line.'],
  'net-rush': ['Find believable reasons to hang back at the baseline after serving.'],
  'compliment-club': ['Make your compliments vague so they are easy to dispute later.'],
  'silent-score': ['Trick someone into saying the score out loud — or slip up yourself, once.'],
};

export function getMission(id: string): Mission | undefined {
  return MISSIONS.find((m) => m.id === id);
}

export function getTraitorOrders(missionId: string): string[] {
  return [...TRAITOR_BRIEFING, ...(TRAITOR_ORDERS[missionId] ?? [])];
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
