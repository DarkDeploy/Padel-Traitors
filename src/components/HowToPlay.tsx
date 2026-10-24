import { useEffect } from 'react';

export default function HowToPlay({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="backdrop" onClick={onClose}>
      <div className="dialog sheet" role="dialog" aria-modal="true" aria-labelledby="how-title" onClick={(e) => e.stopPropagation()}>
        <h2 id="how-title">How it works</h2>
        <ol className="how-list">
          <li>
            <strong>Pass the phone.</strong> Everyone holds to see their secret role and mission.
          </li>
          <li>
            <strong>Faithful</strong> share one habit to lean into on court. Subtle — the Traitors are watching.
          </li>
          <li>
            <strong>Traitors</strong> know each other and share a risky dare (two if someone sits out — either
            counts). Spot the habit, copy it, blend in.
          </li>
          <li>
            <strong>Play your game</strong>, agree on one suspect, then reveal.
          </li>
        </ol>
        <p className="muted small">
          One question decides it: did the Traitors get caught? Named as the suspect, or no dare happened, means
          caught and the Faithful win. Otherwise the Traitors win.
        </p>
        <p className="muted small">Everything is saved on this phone only.</p>
        <button className="btn btn-primary btn-block" onClick={onClose}>
          Got it
        </button>
      </div>
    </div>
  );
}
