import { cryptoRandomInt, type RandomInt } from './random';
import type { Mission } from './types';

/**
 * Secret missions, designed to be done quietly during a 15–20 minute block.
 * Each round the Faithful get one and the Traitors get a different one, so
 * spotting someone working on the "wrong" mission is a clue.
 * To add a mission, append an entry with a unique id.
 */
export const MISSIONS: Mission[] = [
  // Shots
  { id: 'lob-count', title: 'Lob Count', faithful: 'Win 3 points with a lob.', traitor: 'Win 2 points with a lob.' },
  {
    id: 'long-rallies',
    title: 'Long Rallies',
    faithful: 'Play 2 rallies of 12 shots or more.',
    traitor: 'Play a rally of 12 shots or more.',
  },
  {
    id: 'middle-magnet',
    title: 'Middle Magnet',
    faithful: 'Win 3 points with a shot down the middle.',
    traitor: 'Win 2 points with a shot down the middle.',
  },
  {
    id: 'glass-winners',
    title: 'Glass Winners',
    faithful: 'Win 3 points with a shot played off the back glass.',
    traitor: 'Win 2 points with a shot played off the back glass.',
  },
  { id: 'volley-kings', title: 'Volley Kings', faithful: 'Win 4 points with a volley.', traitor: 'Win 2 points with a volley.' },
  { id: 'wide-serves', title: 'Wide Serves', faithful: 'Serve every serve wide.', traitor: 'Serve every serve wide.' },
  {
    id: 'three-bounces',
    title: 'Three Bounces',
    faithful: 'Bounce the ball exactly 3 times before every serve.',
    traitor: 'Bounce the ball exactly 3 times before every serve.',
  },
  // Score
  {
    id: 'deuce-drama',
    title: 'Deuce Drama',
    faithful: 'Get 2 games to deuce (40–40).',
    traitor: 'Get 2 games to deuce (40–40).',
  },
  {
    id: 'neck-and-neck',
    title: 'Neck and Neck',
    faithful: 'Finish the block with the games level or one apart.',
    traitor: 'Finish the block with the games level or one apart.',
  },
  {
    id: 'comeback',
    title: 'Comeback',
    faithful: 'See a team win a game from 0–30 down.',
    traitor: 'See a team win a game from 0–30 down.',
  },
  { id: 'love-game', title: 'Love Game', faithful: 'See a team win a game to love.', traitor: 'See a team win a game to love.' },
  {
    id: 'last-word',
    title: 'Last Word',
    faithful: 'A Faithful hits the winning shot of the final point.',
    traitor: 'Hit the winning shot of the final point yourself.',
  },
  // Social
  {
    id: 'ball-duty',
    title: 'Ball Duty',
    faithful: 'Each of you hands the balls to the server 3 times.',
    traitor: 'Hand the balls to the server 4 times.',
  },
  {
    id: 'racket-taps',
    title: 'Racket Taps',
    faithful: 'Get 5 racket taps with a partner after winning points.',
    traitor: 'Get 3 racket taps with your partner after winning points.',
  },
  {
    id: 'score-muddle',
    title: 'Score Muddle',
    faithful: 'Get someone to ask "what\'s the score?" 3 times.',
    traitor: 'Get someone to ask "what\'s the score?" twice.',
  },
  {
    id: 'wrong-score',
    title: 'Wrong Score',
    faithful: 'Get a wrong score played on without anyone correcting it.',
    traitor: 'Get a wrong score played on without anyone correcting it.',
  },
  { id: 'play-a-let', title: 'Play a Let', faithful: 'Get 2 points replayed.', traitor: 'Get a point replayed.' },
  {
    id: 'water-break',
    title: 'Water Break',
    faithful: 'Get the group to stop for a drink before the block ends.',
    traitor: 'Get the group to stop for a drink before the block ends.',
  },
  {
    id: 'swap-sides',
    title: 'Swap Sides',
    faithful: 'Get a pair to swap left and right sides mid-block.',
    traitor: 'Get a pair to swap left and right sides mid-block.',
  },
  {
    id: 'good-shot',
    title: 'Good Shot',
    faithful: 'Get opponents to say "good shot" to you 4 times in total.',
    traitor: 'Get an opponent to say "good shot" to you twice.',
  },
];

export function getMission(id: string): Mission | undefined {
  return MISSIONS.find((m) => m.id === id);
}

function pick(pool: readonly Mission[], avoid: (string | null)[], randomInt: RandomInt): Mission {
  const preferred = pool.filter((m) => !avoid.includes(m.id));
  const choices = preferred.length > 0 ? preferred : pool;
  return choices[randomInt(choices.length)];
}

/**
 * Picks the Faithful and Traitor missions for a round. They are always different,
 * and each avoids repeating the previous round's mission when alternatives exist.
 */
export function selectMissions(
  previousFaithfulId: string | null,
  previousTraitorId: string | null,
  missions: readonly Mission[] = MISSIONS,
  randomInt: RandomInt = cryptoRandomInt,
): { faithful: Mission; traitor: Mission } {
  if (missions.length < 2) throw new Error('At least two missions are needed.');
  const faithful = pick(missions, [previousFaithfulId], randomInt);
  const rest = missions.filter((m) => m.id !== faithful.id);
  const traitor = pick(rest, [previousTraitorId], randomInt);
  return { faithful, traitor };
}
