import { useRef, useState } from 'react';
import * as game from './game';
import { clearSession, loadSession, saveSession } from './storage';
import type { Session } from './types';
import ConfirmDialog from './components/ConfirmDialog';
import CorruptDataScreen from './components/CorruptDataScreen';
import HandoverScreen from './components/HandoverScreen';
import PickPlayerScreen from './components/PickPlayerScreen';
import PlayingScreen from './components/PlayingScreen';
import RoleCard from './components/RoleCard';
import RoundRevealScreen from './components/RoundRevealScreen';
import SetupScreen from './components/SetupScreen';

type Dialog = 'next' | 'reset' | 'abandon' | 'reveal' | null;

/** Re-checking a role after dealing: first pick a name, then hold to view. Never persisted. */
type Recheck = { step: 'pick' } | { step: 'view'; playerId: string; viewed: boolean } | null;

interface AppProps {
  /** Delay before "Hold to view" works, so a stray tap can't flash the next player's card. */
  passDelayMs?: number;
}

export default function App({ passDelayMs = 600 }: AppProps) {
  const [initial] = useState(loadSession);
  const [corrupt, setCorrupt] = useState(initial.status === 'corrupt');
  const [session, setSession] = useState<Session>(() =>
    initial.status === 'ok' ? initial.session : game.createSession(),
  );
  const [saveFailed, setSaveFailed] = useState(false);
  const [dialog, setDialog] = useState<Dialog>(null);
  const [recheck, setRecheck] = useState<Recheck>(null);

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
    setRecheck(null);
    setDialog(null);
  }

  if (corrupt) return <CorruptDataScreen onStartFresh={resetSession} />;

  const { current } = session;
  const nameOf = (id: string) => session.players.find((p) => p.id === id)?.name ?? '';
  const cardFor = (playerId: string) => {
    const role = game.roleOf(session, playerId);
    return (
      <RoleCard
        role={role}
        faithfulMissionId={current!.faithfulMissionId}
        courtDareId={current!.courtDareId}
        sideDareId={current!.sideDareId}
        fellowTraitors={role === 'traitor' ? game.traitorNames(session).filter((n) => n !== nameOf(playerId)) : []}
      />
    );
  };

  let screen;
  if (session.phase === 'dealing' && current) {
    const player = game.currentPlayer(session)!;
    const i = current.revealIndex;
    const nextId = current.order[i + 1];
    screen = (
      <HandoverScreen
        key={`deal-${current.round}-${i}`}
        name={player.name}
        progress={`${i + 1} / ${current.order.length}`}
        viewed={current.viewed}
        doneLabel={nextId ? `Done — pass to ${nameOf(nextId)}` : 'Done — start playing'}
        delayMs={passDelayMs}
        card={cardFor(player.id)}
        onViewed={() => update(game.markViewed)}
        onDone={() => {
          if (!nextId) navigator.vibrate?.([20, 40, 20]); // everyone's in
          update(game.passPhone);
        }}
        cornerLabel="Back to setup"
        onCorner={() => setDialog('abandon')}
      />
    );
  } else if (session.phase === 'playing' && current) {
    if (recheck?.step === 'pick') {
      screen = (
        <PickPlayerScreen
          players={current.order.map((id) => ({ id, name: nameOf(id) }))}
          onPick={(playerId) => setRecheck({ step: 'view', playerId, viewed: false })}
          onCancel={() => setRecheck(null)}
        />
      );
    } else if (recheck?.step === 'view') {
      screen = (
        <HandoverScreen
          key={`check-${recheck.playerId}`}
          name={nameOf(recheck.playerId)}
          viewed={recheck.viewed}
          doneLabel="Done"
          delayMs={passDelayMs}
          card={cardFor(recheck.playerId)}
          onViewed={() => setRecheck({ ...recheck, viewed: true })}
          onDone={() => setRecheck(null)}
          cornerLabel="Cancel"
          onCorner={() => setRecheck(null)}
        />
      );
    } else {
      screen = <PlayingScreen round={current.round} onCheckRole={() => setRecheck({ step: 'pick' })} onEndRound={() => setDialog('reveal')} />;
    }
  } else if (session.phase === 'revealed' && current) {
    screen = (
      <RoundRevealScreen
        round={current.round}
        faithfulMissionId={current.faithfulMissionId}
        courtDareId={current.courtDareId}
        sideDareId={current.sideDareId}
        traitors={game.traitorNames(session)}
        traitorCounts={game.traitorNames(session).map((n) => game.timesTraitor(session, n))}
        winner={session.rounds.find((r) => r.round === current.round)?.winner ?? null}
        onWinner={(w) => update((s) => game.setWinner(s, w))}
        scores={game.scores(session)}
        previousRounds={session.rounds.filter((r) => r.round !== current.round)}
        onNextGame={() => setDialog('next')}
        onEditPlayers={() => update(game.returnToSetup)}
      />
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
        scores={game.scores(session)}
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
      {dialog === 'reveal' && (
        <ConfirmDialog
          title="End round and reveal?"
          confirmLabel="Reveal"
          onConfirm={() => {
            setDialog(null);
            update(game.revealRound);
          }}
          onCancel={() => setDialog(null)}
        >
          First, agree out loud on one suspect.
        </ConfirmDialog>
      )}
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
          New roles and new missions.
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
