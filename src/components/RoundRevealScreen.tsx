import { useState } from 'react';
import { getDare, getFaithfulMission } from '../missions';
import WinRules from './WinRules';

interface Props {
  round: number;
  faithfulMissionId: string;
  courtDareId: string;
  sideDareId: string | null;
  traitors: string[];
  onNextGame: () => void;
  onEditPlayers: () => void;
}

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
          <button className="btn btn-traitor btn-large btn-block" onClick={() => setStep(1)}>
            Reveal the Traitor{plural ? 's' : ''}
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="screen reveal-round">
      <p className="label center">Round {props.round} reveal</p>

      <section className="reveal-block reveal-traitors">
        <p className="label">The Traitor{plural ? 's were' : ' was'}</p>
        <h2>{props.traitors.join(' & ')}</h2>
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
          <button className="btn btn-primary btn-large btn-block" onClick={() => setStep(2)}>
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

          <div className="stack">
            <button className="btn btn-primary btn-large btn-block" onClick={props.onNextGame}>
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
