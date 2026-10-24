import { useEffect, useState, type ReactNode } from 'react';

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

  useEffect(() => {
    if (delayMs <= 0) return;
    const timer = window.setTimeout(() => setReady(true), delayMs);
    return () => window.clearTimeout(timer);
  }, [delayMs]);

  // Hide immediately if the app is backgrounded or loses focus mid-hold.
  useEffect(() => {
    if (!holding) return;
    const hide = () => setHolding(false);
    window.addEventListener('blur', hide);
    document.addEventListener('visibilitychange', hide);
    return () => {
      window.removeEventListener('blur', hide);
      document.removeEventListener('visibilitychange', hide);
    };
  }, [holding]);

  function start() {
    if (!ready) return;
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
          // Keep receiving pointerup even though the card covers the button.
          e.currentTarget.setPointerCapture?.(e.pointerId);
          start();
        }}
        onPointerUp={() => setHolding(false)}
        onPointerCancel={() => setHolding(false)}
        onLostPointerCapture={() => setHolding(false)}
        onKeyDown={(e) => {
          if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) {
            e.preventDefault();
            start();
          }
        }}
        onKeyUp={() => setHolding(false)}
        onBlur={() => setHolding(false)}
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
