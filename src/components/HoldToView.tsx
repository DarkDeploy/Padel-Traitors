import { useEffect, useRef, useState, type ReactNode } from 'react';

interface Props {
  /** The secret content, shown only while the button is held down. */
  children: ReactNode;
  /** Called the first time the card is shown. */
  onViewed: () => void;
  /** Delay before holding works, so a stray tap from the previous player can't flash the card. */
  delayMs: number;
}

export default function HoldToView({ children, onViewed, delayMs }: Props) {
  const [ready, setReady] = useState(delayMs <= 0);
  const [holding, setHolding] = useState(false);
  const pointerId = useRef<number | null>(null);

  useEffect(() => {
    if (delayMs <= 0) return;
    const timer = window.setTimeout(() => setReady(true), delayMs);
    return () => window.clearTimeout(timer);
  }, [delayMs]);

  // While holding, the finger may wander anywhere on the screen: only lifting it
  // (or the app losing focus) hides the card. Scroll gestures are blocked so the
  // browser never cancels the touch.
  useEffect(() => {
    if (!holding) return;
    const release = (e: PointerEvent) => {
      if (pointerId.current === null || e.pointerId === pointerId.current) setHolding(false);
    };
    const hide = () => setHolding(false);
    const block = (e: TouchEvent) => e.preventDefault();
    window.addEventListener('pointerup', release);
    window.addEventListener('pointercancel', release);
    window.addEventListener('blur', hide);
    document.addEventListener('visibilitychange', hide);
    document.addEventListener('touchmove', block, { passive: false });
    return () => {
      window.removeEventListener('pointerup', release);
      window.removeEventListener('pointercancel', release);
      window.removeEventListener('blur', hide);
      document.removeEventListener('visibilitychange', hide);
      document.removeEventListener('touchmove', block);
    };
  }, [holding]);

  function start(id: number | null) {
    if (!ready) return;
    pointerId.current = id;
    setHolding(true);
    navigator.vibrate?.(15);
    onViewed();
  }

  return (
    <>
      <button
        className="hold-btn"
        disabled={!ready}
        aria-pressed={holding}
        onPointerDown={(e) => {
          e.preventDefault();
          start(e.pointerId);
        }}
        onKeyDown={(e) => {
          if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) {
            e.preventDefault();
            start(null);
          }
        }}
        onKeyUp={() => setHolding(false)}
        onContextMenu={(e) => e.preventDefault()}
      >
        <span className="hold-ring" aria-hidden="true" />
        <span className="hold-label">Hold to view</span>
      </button>

      {holding && (
        <div className="hold-overlay" role="dialog" aria-label="Your role">
          {children}
          <p className="hold-hint">Let go to hide</p>
        </div>
      )}
    </>
  );
}
