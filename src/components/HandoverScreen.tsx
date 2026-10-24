import { useEffect, useState } from 'react';

interface Props {
  name: string;
  position: number;
  total: number;
  delayMs: number;
  onReveal: () => void;
  onBackToSetup: () => void;
}

export default function HandoverScreen({ name, position, total, delayMs, onReveal, onBackToSetup }: Props) {
  const [ready, setReady] = useState(delayMs <= 0);

  useEffect(() => {
    if (delayMs <= 0) return;
    const timer = window.setTimeout(() => setReady(true), delayMs);
    return () => window.clearTimeout(timer);
  }, [delayMs]);

  return (
    <main className="screen screen-center handover">
      <button className="corner-btn" aria-label="Back to setup" onClick={onBackToSetup}>
        ←
      </button>
      <p className="muted">Pass the phone to</p>
      <h1 className="handover-name">{name}</h1>
      <button className="btn btn-primary btn-large btn-block" disabled={!ready} onClick={onReveal}>
        Reveal My Role
      </button>
      <p className="progress">
        {position} / {total}
      </p>
    </main>
  );
}
