import { useEffect } from 'react';
import WinRules from './WinRules';

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
            counts). They work out the Faithful habit and copy it to blend in.
          </li>
          <li>
            <strong>Play your game</strong>, agree on one suspect, then reveal.
          </li>
        </ol>
        <WinRules />
        <button className="btn btn-primary btn-block" onClick={onClose}>
          Got it
        </button>
      </div>
    </div>
  );
}
