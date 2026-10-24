import type { ReactNode } from 'react';
import HoldToView from './HoldToView';

interface Props {
  name: string;
  /** e.g. "2 / 5" while dealing; omitted when re-checking a role. */
  progress?: string;
  viewed: boolean;
  doneLabel: string;
  delayMs: number;
  card: ReactNode;
  onViewed: () => void;
  onDone: () => void;
  /** Top-left corner action (back to setup, or cancel a re-check). */
  cornerLabel: string;
  onCorner: () => void;
}

export default function HandoverScreen(props: Props) {
  const { name, progress, viewed, doneLabel, delayMs, card, onViewed, onDone } = props;

  return (
    <main className="screen screen-center handover">
      <button className="corner-btn" aria-label={props.cornerLabel} onClick={props.onCorner}>
        ←
      </button>

      <div className="handover-top">
        <p className="muted">{viewed ? 'Hold again any time' : 'Pass the phone to'}</p>
        <h1 className="handover-name">{name}</h1>
      </div>

      <HoldToView delayMs={delayMs} onViewed={onViewed}>
        {card}
      </HoldToView>

      <div className="handover-bottom">
        {viewed ? (
          <button className="btn btn-primary btn-large btn-block" onClick={onDone}>
            {doneLabel}
          </button>
        ) : (
          <p className="muted small">Eyes away, everyone else.</p>
        )}
        {progress && <p className="progress center">{progress}</p>}
      </div>
    </main>
  );
}
