interface Props {
  round: number;
  /** Suggested line-up per game; empty when everyone plays every game. */
  games: string[][];
  onCheckRole: () => void;
  onEndRound: () => void;
}

export default function PlayingScreen({ round, games, onCheckRole, onEndRound }: Props) {
  return (
    <main className={`screen${games.length ? '' : ' screen-center'}`}>
      <div className={games.length ? 'play-head' : ''}>
        <p className="label">Round {round}</p>
        <h1>Everyone's in. Go play.</h1>
        <p className="muted">Come back after the game and pick a suspect.</p>
      </div>

      {games.length > 0 && (
        <section className="rotation" aria-label="Suggested rotation">
          <ol>
            {games.map((lineup, i) => (
              <li key={i}>
                <span className="label">Game {i + 1}</span>
                <span>{lineup.join(' · ')}</span>
              </li>
            ))}
          </ol>
        </section>
      )}

      <div className="stack play-actions">
        <button className="btn btn-primary btn-block" onClick={onEndRound}>
          End round &amp; reveal
        </button>
        <button className="btn btn-ghost btn-block" onClick={onCheckRole}>
          Check my role
        </button>
      </div>
    </main>
  );
}
