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
            <strong>Faithful</strong> share one habit to lean into on court — without making it obvious.
          </li>
          <li>
            <strong>Traitors</strong> know each other and share one risky dare to pull off unseen.
          </li>
          <li>
            <strong>Play your game</strong>, then agree out loud on one suspect and hit reveal.
          </li>
        </ol>
        <p className="muted small">The win rules are shown at the reveal.</p>
        <button className="btn btn-primary btn-block" onClick={onClose}>
          Got it
        </button>
      </div>
    </div>
  );
}
