import { getMission, getTraitorOrders } from '../missions';
import type { Role } from '../types';

interface Props {
  name: string;
  role: Role;
  missionId: string;
  onHide: () => void;
}

export default function RevealScreen({ name, role, missionId, onHide }: Props) {
  const mission = getMission(missionId);
  const traitor = role === 'traitor';

  return (
    <main className={`screen reveal ${traitor ? 'reveal-traitor' : 'reveal-faithful'}`}>
      <article className="role-card" aria-live="polite">
        <p className="eyebrow">{name}, you are</p>
        <h1 className="role-name">{traitor ? 'A Traitor' : 'Faithful'}</h1>
        <p className="role-tagline">
          {traitor
            ? 'Work against the Faithful in secret. Trust no one.'
            : 'Complete the mission and find the Traitors among you.'}
        </p>

        {mission && (
          <section className="mission" aria-labelledby="mission-title">
            <p className="section-label">{traitor ? 'The Faithful mission' : 'Your mission'}</p>
            <h2 id="mission-title">{mission.title}</h2>
            <p>{mission.description}</p>
            <ul>
              {mission.instructions.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </section>
        )}

        {traitor && (
          <section className="orders" aria-labelledby="orders-title">
            <p className="section-label" id="orders-title">
              Your secret orders
            </p>
            <ul>
              {getTraitorOrders(missionId).map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </section>
        )}
      </article>

      <div className="reveal-footer">
        <button className="btn btn-pass btn-large btn-block" onClick={onHide}>
          Hide &amp; Pass Phone
        </button>
      </div>
    </main>
  );
}
