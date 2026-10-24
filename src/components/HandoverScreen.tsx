import { useEffect, useState } from 'react';

interface Props {
  name: string;
  round: number;
  position: number;
  total: number;
  delayMs: number;
  onReveal: () => void;
  onBackToSetup: () => void;
}

export default function HandoverScreen({ name, round, position, total, delayMs, onReveal, onBackToSetup }: Props) {
  const [ready, setReady] = useState(delayMs <= 0);

  useEffect(() => {
    if (delayMs <= 0) return;
    const timer = window.setTimeout(() => setReady(true), delayMs);
    return () => window.clearTimeout(timer);
  }, [delayMs]);

  return (
    <main className="screen screen-center handover">
      <p className="eyebrow">
        Round {round} · Player {position} of {total}
      </p>
      <div className="progress" aria-hidden="true">
        {Array.from({ length: total }, (_, i) => (
          <span key={i} className={i < position - 1 ? 'done' : i === position - 1 ? 'now' : ''} />
        ))}
      </div>
      <p className="handover-label">Pass the phone to</p>
      <h1 className="handover-name">{name}</h1>
      <p className="muted handover-hint">
        Only {name} should look at the screen.
        <br />
        Everyone else — eyes away.
      </p>
      <button className="btn btn-primary btn-large btn-block" disabled={!ready} onClick={onReveal}>
        Reveal My Role
      </button>
      <button className="btn btn-link" onClick={onBackToSetup}>
        Back to setup
      </button>
    </main>
  );
}
