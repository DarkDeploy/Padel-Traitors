interface Props {
  onNextGame: () => void;
  onEditPlayers: () => void;
}

export default function CompleteScreen({ onNextGame, onEditPlayers }: Props) {
  return (
    <main className="screen screen-center">
      <div className="seal" aria-hidden="true">
        ✓
      </div>
      <h1>Everyone's in. Go play.</h1>
      <button className="btn btn-primary btn-large btn-block" onClick={onNextGame}>
        Next Game
      </button>
      <button className="btn-text" onClick={onEditPlayers}>
        Edit players
      </button>
    </main>
  );
}
