import { getDare, getFaithfulMission } from '../missions';
import type { Role } from '../types';

interface Props {
  role: Role;
  faithfulMissionId: string;
  courtDareId: string;
  sideDareId: string | null;
  /** Names of the other Traitors (Traitor cards only). */
  fellowTraitors: string[];
}

/** Both cards share one layout so a glance from across the court gives nothing away. */
export default function RoleCard({ role, faithfulMissionId, courtDareId, sideDareId, fellowTraitors }: Props) {
  const traitor = role === 'traitor';
  const mission = getFaithfulMission(faithfulMissionId);
  const courtDare = getDare(courtDareId);
  const sideDare = sideDareId ? getDare(sideDareId) : undefined;
  const shared = fellowTraitors.length > 0;

  return (
    <article className={`role-card ${traitor ? 'card-traitor' : 'card-faithful'}`}>
      <header className="role-header">
        <span className="role-icon" aria-hidden="true">
          {traitor ? '🗡️' : '🛡️'}
        </span>
        <h2 className="role-name">{traitor ? 'Traitor' : 'Faithful'}</h2>
        <p className="role-sub">
          {traitor
            ? shared
              ? `Fellow Traitor${fellowTraitors.length > 1 ? 's' : ''}: ${fellowTraitors.join(', ')}`
              : 'You are the only Traitor'
            : 'You are one of the Faithful'}
        </p>
      </header>

      {traitor ? (
        <>
          <section className="card-section">
            <p className="label">{sideDare ? 'Dare · on court' : 'Your dare'}</p>
            <h3>{courtDare?.title}</h3>
            <p className="mission-text">{courtDare?.text}</p>
          </section>
          {sideDare && (
            <section className="card-section">
              <p className="label">Dare · off court</p>
              <h3>{sideDare.title}</h3>
              <p className="mission-text">{sideDare.text}</p>
            </section>
          )}
          <section className="card-section">
            <p>
              {sideDare ? 'Pull off either one' : 'Pull it off'} without getting caught.
              {shared ? ' Shared between you — one is enough.' : ''} Spot the Faithful habit and copy it.
            </p>
          </section>
        </>
      ) : (
        <>
          <section className="card-section">
            <p className="label">Your secret mission</p>
            <h3>{mission?.title}</h3>
            <p className="mission-text">{mission?.text}</p>
          </section>
          <section className="card-section">
            <p>Lean into this while you're on court. Don't overdo it — the Traitors are watching.</p>
          </section>
        </>
      )}
    </article>
  );
}
