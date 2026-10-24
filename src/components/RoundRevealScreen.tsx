import { getFaithfulMission, getTraitorMission } from '../missions';

interface Props {
  round: number;
  faithfulMissionId: string;
  traitorMissionId: string;
  traitors: string[];
  onNextGame: () => void;
  onEditPlayers: () => void;
}

export default function RoundRevealScreen(props: Props) {
  const faithful = getFaithfulMission(props.faithfulMissionId);
  const traitor = getTraitorMission(props.traitorMissionId);
  const plural = props.traitors.length > 1;

  return (
    <main className="screen reveal-round">
      <p className="label">Round {props.round} reveal</p>

      <section className="reveal-block">
        <p className="label">Faithful mission</p>
        <h2>{faithful?.title}</h2>
        <p>{faithful?.text}</p>
      </section>

      <section className="reveal-block reveal-traitors">
        <p className="label">The Traitor{plural ? 's were' : ' was'}</p>
        <h2>{props.traitors.join(' & ')}</h2>
        <p>
          <strong>{traitor?.title}:</strong> {traitor?.text}
        </p>
      </section>

      <section className="rules">
        <p className="label">Who won?</p>
        <ol>
          <li>
            <strong>Traitors win</strong> if they did their mission and the suspect wasn't a Traitor.
          </li>
          <li>
            Otherwise <strong>Faithful win</strong> if they mostly stuck to their mission or the suspect was a Traitor.
          </li>
          <li>Neither? Traitors win.</li>
        </ol>
      </section>

      <div className="stack">
        <button className="btn btn-primary btn-large btn-block" onClick={props.onNextGame}>
          Next Game
        </button>
        <button className="btn-text" onClick={props.onEditPlayers}>
          Edit players
        </button>
      </div>
    </main>
  );
}
