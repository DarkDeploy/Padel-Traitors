import { cryptoRandomInt, type RandomInt } from './random';
import type { Mission } from './types';

/**
 * Faithful missions: a habit every Faithful leans into while on court. Unusual
 * enough that a watchful Traitor can spot the pattern, normal enough that one
 * person doing it means nothing.
 */
export const FAITHFUL_MISSIONS: Mission[] = [
  // Tactical
  { id: 'middle-serves', title: 'Middle Serves', text: 'Serve down the middle.' },
  { id: 'line-returns', title: 'Line Returns', text: 'Hit most of your returns down the line.' },
  { id: 'stay-back', title: 'Stay Back', text: 'Stay back after serving rather than rushing the net.' },
  { id: 'target-left', title: 'Target Left', text: 'Aim most of your shots at the opponent on the left.' },
  // Shots
  { id: 'lob-lover', title: 'Lob Lover', text: 'Lob more than you normally would.' },
  { id: 'smash-happy', title: 'Smash Happy', text: 'Smash as often as possible.' },
  { id: 'soft-overheads', title: 'Soft Overheads', text: 'Avoid smashing. Go soft on overheads.' },
  { id: 'glass-lover', title: 'Glass Lover', text: 'Let high balls hit the back glass rather than volleying them.' },
  { id: 'wide-second-serves', title: 'Wide Second Serves', text: 'Hit your second serves wide.' },
  // Habits
  { id: 'three-bounces', title: 'Three Bounces', text: 'Bounce the ball 3 times before you serve.' },
  { id: 'practice-swing', title: 'Practice Swing', text: 'Do a practice swing before returning serve.' },
  { id: 'drink-up', title: 'Drink Up', text: 'Have a sip of water when you change ends.' },
  { id: 'racket-taps', title: 'Racket Taps', text: 'Tap rackets with your partner when you win points.' },
  // Talk
  { id: 'cheers', title: 'Cheers', text: 'Say "cheers" when someone passes you the balls.' },
  { id: 'compliments', title: 'Compliments', text: "Compliment your opponents' good shots." },
  { id: 'my-bad', title: 'My Bad', text: 'Say "my bad" instead of "sorry".' },
  { id: 'score-flip', title: 'Score Flip', text: "Say the other team's score first." },
  // Funny
  { id: 'iguales', title: 'Iguales', text: 'Call deuce "iguales".' },
  { id: 'textbook', title: 'Textbook', text: 'Call good shots "textbook".' },
  { id: 'fist-pump', title: 'Fist Pump', text: 'Give a little fist pump when you win a point.' },
  { id: 'weather-report', title: 'Weather Report', text: 'Mention the weather when you change ends.' },
];

/**
 * Traitor dares: one risky moment. Pulling off any dealt dare without being
 * named the suspect is the Traitors' only way to win.
 */

/** Dares that need you to be playing. */
export const COURT_DARES: Mission[] = [
  { id: 'foot-fault', title: 'Foot Fault', text: 'Get a serve called as a foot fault.' },
  { id: 'wrong-server', title: 'Wrong Server', text: 'Get the wrong player to serve a game.' },
  { id: 'wrong-ends', title: 'Wrong Ends', text: 'Get the pairs to change ends at the wrong time.' },
  { id: 'lost-ball', title: 'Lost Ball', text: 'Make a ball go "missing" so play stops to look for it.' },
  { id: 'replay', title: 'Replay', text: 'Get a point replayed.' },
  { id: 'bad-call', title: 'Bad Call', text: 'Get a ball that was in called out, and the point stands.' },
  { id: 'made-up-rule', title: 'Made-Up Rule', text: 'Get a point played under a rule you invented.' },
  { id: 'split-decision', title: 'Split Decision', text: 'Get your partner to disagree with your call.' },
  { id: 'racket-whisperer', title: 'Racket Whisperer', text: 'Have a proper conversation with your racket out loud.' },
  { id: 'victory-dance', title: 'Victory Dance', text: 'Do a celebration dance after a point.' },
];

/** Dares you can pull off from the sideline (or on court). Only dealt when someone is sitting out. */
export const SIDE_DARES: Mission[] = [
  { id: 'wrong-score', title: 'Wrong Score', text: 'Call out a wrong score from the side and have it stick.' },
  { id: 'fake-stop', title: 'Fake Stop', text: 'Stop play for a reason you made up.' },
  { id: 'commentator', title: 'Commentator', text: "Commentate a whole point out loud like it's on TV." },
  { id: 'slow-clap', title: 'Slow Clap', text: 'Start a slow clap and get someone to join in.' },
  { id: 'wrong-vamos', title: 'Wrong Vamos', text: 'Shout "Vamos!" for the team that just lost the point.' },
  { id: 'wrong-name', title: 'Wrong Name', text: 'Call a player by the wrong name without them noticing.' },
  { id: 'take-a-bow', title: 'Take a Bow', text: 'Get a player to take a bow after a point.' },
  { id: 'sing-along', title: 'Sing-Along', text: 'Sing a line of a song and get someone to join in.' },
  { id: 'look-up', title: 'Look Up', text: "Get the group to look at something that isn't there." },
  { id: 'accent', title: 'Accent', text: 'Speak in a fake accent for a whole game without explaining why.' },
];

export const getFaithfulMission = (id: string) => FAITHFUL_MISSIONS.find((m) => m.id === id);
export const getDare = (id: string) => COURT_DARES.find((m) => m.id === id) ?? SIDE_DARES.find((m) => m.id === id);

/** Random mission, avoiding the previous one when an alternative exists. */
export function pickMission(
  pool: readonly Mission[],
  previousId: string | null,
  randomInt: RandomInt = cryptoRandomInt,
): Mission {
  if (pool.length === 0) throw new Error('No missions configured.');
  const choices = pool.length > 1 ? pool.filter((m) => m.id !== previousId) : pool;
  return choices[randomInt(choices.length)];
}
