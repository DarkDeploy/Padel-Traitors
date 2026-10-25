import { useEffect } from 'react';
import { getFaithfulMission } from '../missions';
import type { RoundRecord } from '../types';

interface Props {
  rounds: RoundRecord[];
  scores: { faithful: number; traitors: number };
  onClose: () => void;
}

export default function HistorySheet({ rounds, scores, onClose }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="backdrop" onClick={onClose}>
      <div className="dialog" role="dialog" aria-modal="true" aria-labelledby="history-title" onClick={(e) => e.stopPropagation()}>
        <h2 id="history-title">History</h2>
        <p className="score" aria-label="Session score">
          Faithful <strong>{scores.faithful}</strong> – <strong>{scores.traitors}</strong> Traitors
        </p>
        <ul className="history">
          {[...rounds].reverse().map((r) => (
            <li key={r.round}>
              <p className="label">Round {r.round}</p>
              <p>
                <strong>{getFaithfulMission(r.faithfulMissionId)?.title}</strong>
                <span className="muted"> · Traitor{r.traitors.length > 1 ? 's' : ''}: {r.traitors.join(' & ')}</span>
              </p>
              <p className={r.winner ? 'muted' : 'muted small'}>
                {r.winner === 'faithful' ? 'Faithful won' : r.winner === 'traitors' ? 'Traitors won' : 'Not recorded'}
              </p>
            </li>
          ))}
        </ul>
        <button className="btn btn-primary btn-block" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}
