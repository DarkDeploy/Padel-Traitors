import { getMission, getTraitorTask } from '../missions';
import type { Role } from '../types';

interface Props {
  role: Role;
  missionId: string;
  onHide: () => void;
}

export default function RevealScreen({ role, missionId, onHide }: Props) {
  const mission = getMission(missionId);
  const traitor = role === 'traitor';

  return (
    <main className={`screen reveal ${traitor ? 'reveal-traitor' : 'reveal-faithful'}`}>
      <article className="role-card">
        <h1 className="role-name">{traitor ? 'Traitor' : 'Faithful'}</h1>
        {mission && (
          <section className="card-section">
            <p className="label">Mission</p>
            <h2>{mission.title}</h2>
            <p>{mission.description}</p>
          </section>
        )}
        {traitor && (
          <section className="card-section task">
            <p className="label">Your secret task</p>
            <p>{getTraitorTask(missionId)}</p>
          </section>
        )}
      </article>
      <button className="btn btn-primary btn-large btn-block" onClick={onHide}>
        Hide &amp; Pass Phone
      </button>
    </main>
  );
}
