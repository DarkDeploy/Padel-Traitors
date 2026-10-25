import { useEffect } from 'react';
import type { Winner } from '../types';

interface Props {
  round: number;
  /** Records the result (or not) and deals the next round. */
  onPick: (winner: Winner | null) => void;
  onCancel: () => void;
}

/** Shown when the host taps Next Game: one tap records the result and deals. */
export default function WhoWonSheet({ round, onPick, onCancel }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onCancel();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onCancel]);

  return (
    <div className="backdrop" onClick={onCancel}>
      <div
        className="dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="whowon-title"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="label">Round {round}</p>
        <h2 id="whowon-title">Who won?</h2>
        <div className="dialog-actions">
          <button className="btn btn-primary" onClick={() => onPick('faithful')}>
            Faithful
          </button>
          <button className="btn btn-traitor" onClick={() => onPick('traitors')}>
            Traitors
          </button>
        </div>
        <button className="btn-text center" onClick={() => onPick(null)}>
          Skip
        </button>
      </div>
    </div>
  );
}
