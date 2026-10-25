import type { Player } from '../types';

interface Props {
  players: Player[];
  onPick: (id: string) => void;
  onCancel: () => void;
}

export default function PickPlayerScreen({ players, onPick, onCancel }: Props) {
  return (
    <main className="screen">
      <button className="corner-btn" aria-label="Cancel" onClick={onCancel}>
        ×
      </button>
      <h1 className="pick-title">Who's checking?</h1>
      <ul className="pick-list">
        {players.map((p) => (
          <li key={p.id}>
            <button className="btn btn-ghost btn-block" onClick={() => onPick(p.id)}>
              {p.name}
            </button>
          </li>
        ))}
      </ul>
    </main>
  );
}
