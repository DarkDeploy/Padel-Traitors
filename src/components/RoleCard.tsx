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
              {shared
                ? `Between you, pull off ${sideDare ? 'one of these' : 'this'} without being caught.`
                : `Pull ${sideDare ? 'one of these' : 'this'} off without being caught.`}{' '}
              The Faithful all share a habit — work out what it is and do it too, so you blend in.
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
            <p>Do this whenever you're on court, as naturally as you can. The Traitors are watching for anything that looks forced.</p>
          </section>
        </>
      )}
    </article>
  );
}
