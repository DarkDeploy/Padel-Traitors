import { useState } from 'react';
import { getDare, getFaithfulMission } from '../missions';
import type { Winner } from '../types';
import WinRules from './WinRules';

interface Props {
  round: number;
  faithfulMissionId: string;
  courtDareId: string;
  sideDareId: string | null;
  traitors: string[];
  /** Times each Traitor (same order) has now been a Traitor this session. */
  traitorCounts: number[];
  winner: Winner | null;
  onWinner: (winner: Winner | null) => void;
  scores: { faithful: number; traitors: number };
  onNextGame: () => void;
  onEditPlayers: () => void;
}

const ordinal = (n: number) => `${n}${['th', 'st', 'nd', 'rd'][n % 100 > 10 && n % 100 < 14 ? 0 : n % 10 < 4 ? n % 10 : 0]}`;

/** Revealed in stages so the host can build a little suspense. */
export default function RoundRevealScreen(props: Props) {
  const [step, setStep] = useState(0);
  const faithful = getFaithfulMission(props.faithfulMissionId);
  const courtDare = getDare(props.courtDareId);
  const sideDare = props.sideDareId ? getDare(props.sideDareId) : undefined;
  const plural = props.traitors.length > 1;

  if (step === 0) {
    return (
      <main className="screen screen-center reveal-round">
        <p className="label">Round {props.round}</p>
        <h1>The moment of truth</h1>
        <p className="muted">Everyone agreed on one suspect? Point at them.</p>
        <div className="stack">
          <button className="btn btn-traitor btn-block" onClick={() => setStep(1)}>
            Reveal the Traitor{plural ? 's' : ''}
          </button>
        </div>
      </main>
    );
  }

  const honours = props.traitors
    .map((name, i) => (props.traitorCounts[i] > 1 ? `${name}'s ${ordinal(props.traitorCounts[i])} time` : null))
    .filter(Boolean)
    .join(' · ');

  return (
    <main className="screen reveal-round">
      <p className="label center">Round {props.round} reveal</p>

      <section className="reveal-block reveal-traitors">
        <p className="label">The Traitor{plural ? 's were' : ' was'}</p>
        <h2>{props.traitors.join(' & ')}</h2>
        {honours && <p className="muted small">{honours}</p>}
        <p className="mission-text">
          <strong>{courtDare?.title}</strong>: {courtDare?.text}
        </p>
        {sideDare && (
          <p className="mission-text">
            <strong>{sideDare.title}</strong>: {sideDare.text}
          </p>
        )}
        <p className="muted small">Did they pull {sideDare ? 'either' : 'it'} off? Were they the suspect?</p>
      </section>

      {step === 1 ? (
        <div className="stack">
          <p className="muted center">
            Traitor{plural ? 's' : ''} — what was the Faithful mission?
            <br />
            Guess out loud.
          </p>
          <button className="btn btn-primary btn-block" onClick={() => setStep(2)}>
            Reveal the Faithful mission
          </button>
        </div>
      ) : (
        <>
          <section className="reveal-block">
            <p className="label">The Faithful were</p>
            <h2>{faithful?.title}</h2>
            <p className="mission-text">{faithful?.text}</p>
          </section>

          <WinRules />

          <div className="segmented" role="group" aria-label="Who won">
            {(['faithful', 'traitors'] as const).map((w) => (
              <button
                key={w}
                className={props.winner === w ? 'on' : ''}
                aria-pressed={props.winner === w}
                onClick={() => props.onWinner(props.winner === w ? null : w)}
              >
                {w === 'faithful' ? 'Faithful won' : 'Traitors won'}
              </button>
            ))}
          </div>
          <p className="muted small center score-line">
            Faithful {props.scores.faithful} – {props.scores.traitors} Traitors
          </p>

          <div className="stack">
            <button className="btn btn-primary btn-block" onClick={props.onNextGame}>
              Next Game
            </button>
            <button className="btn-text" onClick={props.onEditPlayers}>
              Edit players
            </button>
          </div>
        </>
      )}
    </main>
  );
}
