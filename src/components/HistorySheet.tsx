import { getFaithfulMission } from '../missions';
import type { RoundRecord } from '../types';
import Sheet from './Sheet';

interface Props {
  rounds: RoundRecord[];
  scores: { faithful: number; traitors: number };
  onClose: () => void;
}

export default function HistorySheet({ rounds, scores, onClose }: Props) {
  return (
    <Sheet labelledBy="history-title" onClose={onClose}>
      <h2 id="history-title">Scores</h2>
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
    </Sheet>
  );
}
