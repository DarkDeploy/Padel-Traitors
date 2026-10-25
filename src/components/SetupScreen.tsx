import { useState, type FormEvent } from 'react';
import HowToPlay from './HowToPlay';
import { configError, MAX_NAME_LENGTH } from '../game';
import type { Player, Session } from '../types';

interface Props {
  session: Session;
  onAdd: (name: string) => string | null;
  onRename: (id: string, name: string) => string | null;
  onRemove: (id: string) => void;
  onTraitorCount: (n: number) => void;
  onStart: () => string | null;
  onReset: () => void;
}

export default function SetupScreen(props: Props) {
  const { session, onAdd, onTraitorCount, onStart, onReset } = props;
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  const count = session.players.length;
  const maxTraitors = Math.max(1, count - 1);
  // Config problems (too few players, no Faithful) just disable Start; the UI makes them obvious.
  const problem = configError(session);

  function submit(e: FormEvent) {
    e.preventDefault();
    const err = onAdd(name);
    setError(err);
    if (!err) setName('');
  }

  return (
    <main className="screen setup">
      <h1 className="brand">
        Padel <span>Traitors</span>
      </h1>

      <form className="add-form" onSubmit={submit}>
        <label className="sr-only" htmlFor="new-player">
          Player name
        </label>
        <input
          id="new-player"
          value={name}
          maxLength={MAX_NAME_LENGTH}
          placeholder="Player name"
          autoComplete="off"
          autoCapitalize="words"
          enterKeyHint="done"
          onChange={(e) => {
            setName(e.target.value);
            setError(null);
          }}
        />
        <button className="btn btn-primary" type="submit">
          Add
        </button>
      </form>

      {count > 0 && (
        <ul className="player-list">
          {session.players.map((p) => (
            <PlayerRow key={p.id} player={p} {...props} onError={setError} />
          ))}
        </ul>
      )}

      <div className="traitors">
        <span>Traitors</span>
        <div className="stepper">
          <button
            className="btn btn-round"
            aria-label="Fewer Traitors"
            disabled={session.traitorCount <= 1}
            onClick={() => onTraitorCount(Math.min(session.traitorCount - 1, maxTraitors))}
          >
            −
          </button>
          <output aria-live="polite" aria-label="Number of Traitors">
            {session.traitorCount}
          </output>
          <button
            className="btn btn-round"
            aria-label="More Traitors"
            disabled={session.traitorCount >= maxTraitors}
            onClick={() => onTraitorCount(session.traitorCount + 1)}
          >
            +
          </button>
        </div>
      </div>

      <div className="start">
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        <button
          className="btn btn-primary btn-block"
          disabled={problem !== null}
          onClick={() => setError(onStart())}
        >
          {session.completedRounds > 0 ? 'Start Next Game' : 'Start Game'}
        </button>
      </div>

      <footer className="footnote">
        <button className="btn-text" onClick={() => setShowHelp(true)}>
          How it works
        </button>
        {' · '}
        <button className="btn-text" onClick={onReset}>
          Reset
        </button>
      </footer>
      {showHelp && <HowToPlay onClose={() => setShowHelp(false)} />}
    </main>
  );
}

function PlayerRow({
  player,
  onRename,
  onRemove,
  onError,
}: Props & { player: Player; onError: (error: string | null) => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(player.name);

  function save(e?: FormEvent) {
    e?.preventDefault();
    const err = onRename(player.id, draft);
    onError(err);
    if (!err) setEditing(false);
  }

  if (editing) {
    return (
      <li className="player">
        <form className="rename-form" onSubmit={save}>
          <label className="sr-only" htmlFor={`edit-${player.id}`}>
            Edit name for {player.name}
          </label>
          <input
            id={`edit-${player.id}`}
            value={draft}
            maxLength={MAX_NAME_LENGTH}
            autoFocus
            autoComplete="off"
            enterKeyHint="done"
            onChange={(e) => setDraft(e.target.value)}
            onBlur={() => save()}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                onError(null);
                setEditing(false);
              }
            }}
          />
        </form>
      </li>
    );
  }

  return (
    <li className="player">
      <span className="avatar" aria-hidden="true">
        {player.name.trim().charAt(0).toUpperCase()}
      </span>
      <button
        className="player-name"
        aria-label={`Edit ${player.name}`}
        onClick={() => {
          setDraft(player.name);
          setEditing(true);
        }}
      >
        {player.name}
      </button>
      <button className="btn btn-icon" aria-label={`Remove ${player.name}`} onClick={() => onRemove(player.id)}>
        ×
      </button>
    </li>
  );
}
