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
        <div className="choices">
          <button className="choice choice-faithful" onClick={() => onPick('faithful')}>
            <span className="choice-name">Faithful</span>
            <span className="choice-hint">Caught a Traitor, or no dare was pulled off</span>
          </button>
          <button className="choice choice-traitors" onClick={() => onPick('traitors')}>
            <span className="choice-name">Traitors</span>
            <span className="choice-hint">Pulled off a dare and weren't the suspect</span>
          </button>
        </div>
        <button className="btn-text center" onClick={() => onPick(null)}>
          Skip
        </button>
      </div>
    </div>
  );
}
