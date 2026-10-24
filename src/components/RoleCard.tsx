import { getFaithfulMission, getTraitorMission } from '../missions';
import type { Role } from '../types';

interface Props {
  role: Role;
  missionId: string;
  /** Names of the other Traitors (Traitor cards only). */
  fellowTraitors: string[];
}

/** Both cards share one layout so a glance from across the court gives nothing away. */
export default function RoleCard({ role, missionId, fellowTraitors }: Props) {
  const traitor = role === 'traitor';
  const mission = traitor ? getTraitorMission(missionId) : getFaithfulMission(missionId);

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
          <p className="label">{traitor ? 'Your dare' : 'Your secret mission'}</p>
          <h3>{mission.title}</h3>
          <p className="mission-text">{mission.text}</p>
        </section>
      )}

      <section className="card-section">
        <p>
          {traitor
            ? fellowTraitors.length > 0
              ? 'Shared with your fellow Traitors — one of you pulling it off is enough. Sitting out? Spot the Faithful pattern and tip them off.'
              : 'Pull it off without getting caught. It counts from the side of the court too.'
            : "Lean into this while you're on court. Don't overdo it — the Traitors are watching."}
        </p>
      </section>
    </article>
  );
}
