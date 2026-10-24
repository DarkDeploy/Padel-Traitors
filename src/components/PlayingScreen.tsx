interface Props {
  round: number;
  onCheckRole: () => void;
  onEndRound: () => void;
}

export default function PlayingScreen({ round, onCheckRole, onEndRound }: Props) {
  return (
    <main className="screen screen-center">
      <div className="seal" aria-hidden="true">
        ✓
      </div>
      <p className="label">Round {round}</p>
      <h1>Everyone's in. Go play.</h1>
      <p className="muted">Come back after the game and pick a suspect.</p>
      <div className="stack">
        <button className="btn btn-primary btn-large btn-block" onClick={onEndRound}>
          End round &amp; reveal
        </button>
        <button className="btn btn-ghost btn-block" onClick={onCheckRole}>
          Check my role
        </button>
      </div>
    </main>
  );
}
