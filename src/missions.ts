import { cryptoRandomInt, type RandomInt } from './random';
import type { Mission } from './types';

/**
 * Faithful missions: a habit every Faithful leans into while on court. Unusual
 * enough that a watchful Traitor can spot the pattern, normal enough that one
 * person doing it means nothing.
 */
export const FAITHFUL_MISSIONS: Mission[] = [
  // Play
  { id: 'middle-serves', title: 'Middle Serves', text: 'Serve down the middle.' },
  { id: 'line-returns', title: 'Line Returns', text: 'Hit most of your returns down the line.' },
  { id: 'lob-lover', title: 'Lob Lover', text: 'Lob more than you normally would.' },
  { id: 'soft-overheads', title: 'Soft Overheads', text: 'Avoid smashing. Go soft on overheads.' },
  { id: 'stay-back', title: 'Stay Back', text: 'Stay back after serving rather than rushing the net.' },
  { id: 'glass-lover', title: 'Glass Lover', text: 'Let high balls hit the back glass rather than volleying them.' },
  { id: 'wide-second-serves', title: 'Wide Second Serves', text: 'Hit your second serves wide.' },
  // Habits
  { id: 'three-bounces', title: 'Three Bounces', text: 'Bounce the ball 3 times before you serve.' },
  { id: 'practice-swing', title: 'Practice Swing', text: 'Do a practice swing before returning serve.' },
  { id: 'racket-taps', title: 'Racket Taps', text: 'Tap rackets with your partner when you win points.' },
  { id: 'drink-up', title: 'Drink Up', text: 'Have a sip of water when you change ends.' },
  { id: 'long-way-round', title: 'Long Way Round', text: 'Walk round the far side of the net post when you change ends.' },
  { id: 'shoe-check', title: 'Shoe Check', text: 'Tap or retie a shoe when you change ends.' },
  // Talk
  { id: 'cheers', title: 'Cheers', text: 'Say "cheers" when someone passes you the balls.' },
  { id: 'compliments', title: 'Compliments', text: "Compliment your opponents' good shots." },
  { id: 'iguales', title: 'Iguales', text: 'Call deuce "iguales".' },
  { id: 'my-bad', title: 'My Bad', text: 'Say "my bad" instead of "sorry".' },
  { id: 'unlucky', title: 'Unlucky', text: 'Say "unlucky" when someone makes an error.' },
  { id: 'pep-talk', title: 'Pep Talk', text: 'Encourage your partner when you change ends.' },
  { id: 'score-flip', title: 'Score Flip', text: "Say the other team's score first." },
];

/**
 * Traitor missions: one risky moment, doable on court or sitting out. Completing
 * one without being named as the suspect is the Traitors' way to win.
 */
export const TRAITOR_MISSIONS: Mission[] = [
  // Sneaky
  { id: 'made-up-rule', title: 'Made-Up Rule', text: 'Get the group to play a point under a rule you invented.' },
  { id: 'wrong-score', title: 'Wrong Score', text: 'Get a wrong score played on without anyone correcting it.' },
  { id: 'bad-call', title: 'Bad Call', text: 'Get a ball that was in called out, and the point stands.' },
  { id: 'foot-fault', title: 'Foot Fault', text: 'Get a serve called as a foot fault.' },
  { id: 'wrong-server', title: 'Wrong Server', text: 'Get the wrong player to serve a game.' },
  { id: 'wrong-ends', title: 'Wrong Ends', text: 'Get the pairs to change ends at the wrong time.' },
  { id: 'lost-ball', title: 'Lost Ball', text: 'Make a ball go "missing" so play stops to look for it.' },
  { id: 'replay', title: 'Replay', text: 'Get a point replayed.' },
  { id: 'split-decision', title: 'Split Decision', text: 'Get two partners to disagree about a call.' },
  { id: 'score-row', title: 'Score Row', text: 'Get the group arguing about the score.' },
  { id: 'fake-stop', title: 'Fake Stop', text: 'Get play stopped for a reason you made up.' },
  // Silly
  { id: 'commentator', title: 'Commentator', text: "Commentate a whole point out loud like it's on TV." },
  { id: 'slow-clap', title: 'Slow Clap', text: 'Start a slow clap after a point and get someone to join in.' },
  { id: 'wrong-vamos', title: 'Wrong Vamos', text: 'Shout "Vamos!" for the team that just lost the point.' },
  { id: 'wrong-name', title: 'Wrong Name', text: 'Call a player by the wrong name without them noticing.' },
  { id: 'take-a-bow', title: 'Take a Bow', text: 'Get someone to take a bow after a point.' },
  { id: 'sing-along', title: 'Sing-Along', text: 'Sing a line of a song and get someone to join in.' },
  { id: 'racket-whisperer', title: 'Racket Whisperer', text: 'Have a proper conversation with a racket or ball out loud.' },
  { id: 'look-up', title: 'Look Up', text: "Get the group to look at something that isn't there." },
  { id: 'victory-dance', title: 'Victory Dance', text: 'Do a celebration dance after someone wins a point.' },
  { id: 'hug-it-out', title: 'Hug It Out', text: 'Get a hug from another player.' },
  { id: 'accent', title: 'Accent', text: 'Speak in a fake accent for a whole game without explaining why.' },
];

export const getFaithfulMission = (id: string) => FAITHFUL_MISSIONS.find((m) => m.id === id);
export const getTraitorMission = (id: string) => TRAITOR_MISSIONS.find((m) => m.id === id);

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
