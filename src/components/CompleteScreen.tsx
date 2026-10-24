interface Props {
  round: number;
  playerCount: number;
  onNextGame: () => void;
  onEditPlayers: () => void;
  onReset: () => void;
}

export default function CompleteScreen({ round, playerCount, onNextGame, onEditPlayers, onReset }: Props) {
  return (
    <main className="screen screen-center">
      <div className="seal" aria-hidden="true">
        ✓
      </div>
      <p className="eyebrow">Round {round}</p>
      <h1>Dealing complete</h1>
      <p className="muted">
        All {playerCount} players have seen their role. Put the phone away and get on court.
        <br />
        Roles stay secret — they won't be shown again.
      </p>
      <button className="btn btn-primary btn-large btn-block" onClick={onNextGame}>
        Next Game
      </button>
      <button className="btn btn-ghost btn-block" onClick={onEditPlayers}>
        Edit players or Traitors
      </button>
      <button className="btn btn-link" onClick={onReset}>
        Reset session
      </button>
    </main>
  );
}
