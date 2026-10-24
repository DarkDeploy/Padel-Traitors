import { useState } from 'react';
import { getFaithfulMission, getTraitorMission } from '../missions';

interface Props {
  round: number;
  playerCount: number;
  faithfulMissionId: string;
  traitorMissionId: string;
  traitors: string[];
  onNextGame: () => void;
  onEditPlayers: () => void;
}

/** Revealed in stages so the host can build a little suspense. */
export default function RoundRevealScreen(props: Props) {
  const [step, setStep] = useState(0);
  const faithful = getFaithfulMission(props.faithfulMissionId);
  const traitor = getTraitorMission(props.traitorMissionId);
  const plural = props.traitors.length > 1;
  const faithfulCount = props.playerCount - props.traitors.length;

  if (step === 0) {
    return (
      <main className="screen screen-center reveal-round">
        <p className="label">Round {props.round}</p>
        <h1>The moment of truth</h1>
        <p className="muted">
          Everyone agreed on one suspect? Point at them.
          <br />
          Then the host taps.
        </p>
        <div className="stack">
          <button className="btn btn-primary btn-large btn-block" onClick={() => setStep(1)}>
            Reveal the Faithful mission
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="screen reveal-round">
      <p className="label center">Round {props.round} reveal</p>

      <section className="reveal-block">
        <p className="label">The {faithfulCount} Faithful were trying to…</p>
        <h2>{faithful?.title}</h2>
        <p className="mission-text">{faithful?.text}</p>
        <p className="muted small">Faithful — did you mostly stick to it?</p>
      </section>

      {step === 1 ? (
        <div className="stack">
          <p className="muted small center">Last chance to change your suspect.</p>
          <button className="btn btn-traitor btn-large btn-block" onClick={() => setStep(2)}>
            Reveal the Traitor{plural ? 's' : ''}
          </button>
        </div>
      ) : (
        <>
          <section className="reveal-block reveal-traitors">
            <p className="label">The Traitor{plural ? 's were' : ' was'}</p>
            <h2>{props.traitors.join(' & ')}</h2>
            <p className="mission-text">
              Their dare — <strong>{traitor?.title}</strong>: {traitor?.text}
            </p>
            <p className="muted small">Did they pull it off? Was the suspect right?</p>
          </section>

          <section className="rules">
            <p className="label">Who won?</p>
            <ol>
              <li>
                <strong>Traitors win</strong> if they did their dare and the suspect wasn't a Traitor.
              </li>
              <li>
                Otherwise <strong>Faithful win</strong> if they mostly stuck to their mission or the suspect was a
                Traitor.
              </li>
              <li>Neither? Traitors win.</li>
            </ol>
          </section>

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
