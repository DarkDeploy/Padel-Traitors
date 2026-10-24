import { getMission } from '../missions';
import type { Role } from '../types';

interface Props {
  role: Role;
  missionId: string;
  /** Names of the other Traitors (Traitor cards only). */
  fellowTraitors: string[];
}

/** Both cards share one layout so a glance from across the court gives nothing away. */
export default function RoleCard({ role, missionId, fellowTraitors }: Props) {
  const mission = getMission(missionId);
  const traitor = role === 'traitor';

  return (
    <article className={`role-card ${traitor ? 'card-traitor' : 'card-faithful'}`}>
      <header className="role-header">
        <span className="role-icon" aria-hidden="true">
          {traitor ? '🗡️' : '🛡️'}
        </span>
        <h2 className="role-name">{traitor ? 'Traitor' : 'Faithful'}</h2>
        <p className="role-sub">
          {traitor
            ? fellowTraitors.length > 0
              ? `Fellow Traitor${fellowTraitors.length > 1 ? 's' : ''}: ${fellowTraitors.join(', ')}`
              : 'You are the only Traitor'
            : 'You are one of the Faithful'}
        </p>
      </header>

      {mission && (
        <section className="card-section">
          <p className="label">Your secret mission</p>
          <h3>{mission.title}</h3>
          <p className="mission-text">{traitor ? mission.traitor : mission.faithful}</p>
        </section>
      )}

      <section className="card-section">
        <p className="label">{traitor ? 'Also' : 'Remember'}</p>
        <p>
          {traitor
            ? "Work out the Faithful mission. Copy it to blend in, and quietly stop it if you can. Don't get caught."
            : "Be subtle — the Traitors are watching. Look out for anyone who isn't doing the mission."}
        </p>
      </section>
    </article>
  );
}
