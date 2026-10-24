import { useRef, useState } from 'react';
import * as game from './game';
import { clearSession, loadSession, saveSession } from './storage';
import type { Session } from './types';
import ConfirmDialog from './components/ConfirmDialog';
import SetupScreen from './components/SetupScreen';
import HandoverScreen from './components/HandoverScreen';
import RevealScreen from './components/RevealScreen';
import CompleteScreen from './components/CompleteScreen';
import CorruptDataScreen from './components/CorruptDataScreen';

type Dialog = 'next' | 'reset' | 'abandon' | null;

interface AppProps {
  /** Delay before "Reveal My Role" becomes tappable, so a double tap can't expose the next role. */
  passDelayMs?: number;
}

export default function App({ passDelayMs = 700 }: AppProps) {
  const [initial] = useState(loadSession);
  const [corrupt, setCorrupt] = useState(initial.status === 'corrupt');
  const [session, setSession] = useState<Session>(() =>
    initial.status === 'ok' ? initial.session : game.createSession(),
  );
  const [saveFailed, setSaveFailed] = useState(false);
  const [dialog, setDialog] = useState<Dialog>(null);

  // The ref always holds the latest session so rapid repeated taps see the state
  // left by the previous tap, and the phase guards in game.ts turn repeats into no-ops.
  const latest = useRef(session);

  function update(change: (s: Session) => Session) {
    const next = change(latest.current);
    if (next === latest.current) return;
    latest.current = next;
    setSaveFailed(!saveSession(next));
    setSession(next);
  }

  function apply(change: (s: Session) => game.Result): string | null {
    const result = change(latest.current);
    if (result.error !== undefined) return result.error;
    update(() => result.session);
    return null;
  }

  function resetSession() {
    clearSession();
    const fresh = game.createSession();
    latest.current = fresh;
    setSession(fresh);
    setSaveFailed(false);
    setCorrupt(false);
    setDialog(null);
  }

  if (corrupt) return <CorruptDataScreen onStartFresh={resetSession} />;

  const { current } = session;
  const player = game.currentPlayer(session);

  let screen;
  if (session.phase === 'dealing' && current && player) {
    screen = current.revealing ? (
      <RevealScreen
        key={`reveal-${current.revealIndex}`}
        role={game.roleOf(session, player.id)}
        missionId={current.missionId}
        onHide={() => update(game.hideAndPass)}
      />
    ) : (
      <HandoverScreen
        key={`handover-${current.round}-${current.revealIndex}`}
        name={player.name}
        position={current.revealIndex + 1}
        total={current.order.length}
        delayMs={passDelayMs}
        onReveal={() => update(game.revealRole)}
        onBackToSetup={() => setDialog('abandon')}
      />
    );
  } else if (session.phase === 'complete' && current) {
    screen = (
      <CompleteScreen onNextGame={() => setDialog('next')} onEditPlayers={() => update(game.returnToSetup)} />
    );
  } else {
    screen = (
      <SetupScreen
        session={session}
        onAdd={(name) => apply((s) => game.addPlayer(s, name))}
        onRename={(id, name) => apply((s) => game.renamePlayer(s, id, name))}
        onRemove={(id) => update((s) => game.removePlayer(s, id))}
        onTraitorCount={(n) => update((s) => game.setTraitorCount(s, n))}
        onStart={() => apply((s) => game.startRound(s))}
        onReset={() => setDialog('reset')}
      />
    );
  }

  return (
    <>
      {saveFailed && (
        <p className="banner" role="status">
          Not saving on this browser — keep this tab open.
        </p>
      )}
      {screen}
      {dialog === 'next' && (
        <ConfirmDialog
          title="Start next game?"
          confirmLabel="Deal"
          onConfirm={() => {
            setDialog(null);
            apply((s) => game.startRound(s));
          }}
          onCancel={() => setDialog(null)}
        >
          New roles and a new mission.
        </ConfirmDialog>
      )}
      {dialog === 'abandon' && (
        <ConfirmDialog
          title="Abandon this deal?"
          confirmLabel="Abandon"
          danger
          onConfirm={() => {
            setDialog(null);
            update(game.returnToSetup);
          }}
          onCancel={() => setDialog(null)}
        >
          Roles will be dealt again.
        </ConfirmDialog>
      )}
      {dialog === 'reset' && (
        <ConfirmDialog
          title="Reset everything?"
          confirmLabel="Reset"
          danger
          onConfirm={resetSession}
          onCancel={() => setDialog(null)}
        >
          All players and history will be deleted.
        </ConfirmDialog>
      )}
    </>
  );
}
