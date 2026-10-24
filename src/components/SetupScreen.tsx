import { useState, type FormEvent } from 'react';
import { activePlayers, configError, MAX_NAME_LENGTH } from '../game';
import type { Player, Session } from '../types';

interface Props {
  session: Session;
  onAdd: (name: string) => string | null;
  onRename: (id: string, name: string) => string | null;
  onRemove: (id: string) => void;
  onToggleActive: (id: string, active: boolean) => void;
  onTraitorCount: (n: number) => void;
  onStart: () => string | null;
  onReset: () => void;
}

export default function SetupScreen(props: Props) {
  const { session, onAdd, onTraitorCount, onStart, onReset } = props;
  const [name, setName] = useState('');
  const [addError, setAddError] = useState<string | null>(null);
  const [startError, setStartError] = useState<string | null>(null);

  const active = activePlayers(session).length;
  const maxTraitors = Math.max(1, active - 1);
  const problem = configError(session);
  const nextRound = session.completedRounds + 1;

  function submit(e: FormEvent) {
    e.preventDefault();
    const error = onAdd(name);
    setAddError(error);
    if (!error) setName('');
  }

  return (
    <main className="screen setup">
      <header className="brand">
        <h1>
          Padel <span>Traitors</span>
        </h1>
        <p className="muted">
          {session.completedRounds > 0
            ? `Setting up round ${nextRound}. Traitor history from earlier rounds is kept.`
            : 'Add your players, choose how many Traitors, then pass the phone around.'}
        </p>
      </header>

      <section className="panel" aria-labelledby="players-heading">
        <h2 id="players-heading">
          Players <span className="count">{session.players.length}</span>
        </h2>
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
            aria-invalid={addError ? true : undefined}
            aria-describedby={addError ? 'add-error' : undefined}
            onChange={(e) => {
              setName(e.target.value);
              setAddError(null);
            }}
          />
          <button className="btn btn-primary" type="submit">
            Add
          </button>
        </form>
        {addError && (
          <p className="error" id="add-error" role="alert">
            {addError}
          </p>
        )}

        {session.players.length === 0 ? (
          <p className="empty">No players yet.</p>
        ) : (
          <ul className="player-list">
            {session.players.map((p) => (
              <PlayerRow key={p.id} player={p} {...props} />
            ))}
          </ul>
        )}
      </section>

      <section className="panel" aria-labelledby="traitors-heading">
        <h2 id="traitors-heading">Traitors</h2>
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
        <p className="muted small">
          {active} playing · {Math.max(0, active - session.traitorCount)} Faithful
        </p>
      </section>

      <div className="start">
        {(startError ?? problem) && (
          <p className="error" role="alert">
            {startError ?? problem}
          </p>
        )}
        <button
          className="btn btn-primary btn-large btn-block"
          disabled={problem !== null}
          onClick={() => setStartError(onStart())}
        >
          {session.completedRounds > 0 ? `Start Round ${nextRound}` : 'Start Game'}
        </button>
      </div>

      <footer className="footnote">
        <p>
          The session is saved only in this browser on this phone, so a refresh won't lose it. It's a casual game, not a
          vault: anyone poking around the browser's developer tools could find the roles.
        </p>
        <button className="btn btn-link" onClick={onReset}>
          Reset session
        </button>
      </footer>
    </main>
  );
}

function PlayerRow({ player, onRename, onRemove, onToggleActive }: Props & { player: Player }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(player.name);
  const [error, setError] = useState<string | null>(null);

  function save(e: FormEvent) {
    e.preventDefault();
    const err = onRename(player.id, draft);
    setError(err);
    if (!err) setEditing(false);
  }

  if (editing) {
    return (
      <li className="player editing">
        <form className="add-form" onSubmit={save}>
          <label className="sr-only" htmlFor={`edit-${player.id}`}>
            Edit name for {player.name}
          </label>
          <input
            id={`edit-${player.id}`}
            value={draft}
            maxLength={MAX_NAME_LENGTH}
            autoFocus
            autoComplete="off"
            onChange={(e) => {
              setDraft(e.target.value);
              setError(null);
            }}
            onKeyDown={(e) => e.key === 'Escape' && setEditing(false)}
          />
          <button className="btn btn-primary" type="submit">
            Save
          </button>
          <button className="btn btn-ghost" type="button" onClick={() => setEditing(false)}>
            Cancel
          </button>
        </form>
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
      </li>
    );
  }

  return (
    <li className={`player${player.active ? '' : ' sitting-out'}`}>
      <span className="player-name">{player.name}</span>
      <label className="toggle">
        <input
          type="checkbox"
          checked={player.active}
          onChange={(e) => onToggleActive(player.id, e.target.checked)}
        />
        <span>{player.active ? 'Playing' : 'Sitting out'}</span>
      </label>
      <button
        className="btn btn-icon"
        aria-label={`Edit ${player.name}`}
        onClick={() => {
          setDraft(player.name);
          setError(null);
          setEditing(true);
        }}
      >
        ✎
      </button>
      <button className="btn btn-icon" aria-label={`Remove ${player.name}`} onClick={() => onRemove(player.id)}>
        ×
      </button>
    </li>
  );
}
