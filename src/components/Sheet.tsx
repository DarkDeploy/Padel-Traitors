import { useEffect, useRef, useState, type ReactNode } from 'react';

interface Props {
  labelledBy: string;
  role?: 'dialog' | 'alertdialog';
  className?: string;
  children: ReactNode;
  onClose: () => void;
}

/** iOS-style bottom sheet: dismiss on Escape, tap outside, a long drag or a quick flick. */
export default function Sheet({ labelledBy, role = 'dialog', className, children, onClose }: Props) {
  const sheet = useRef<HTMLDivElement>(null);
  const [dragY, setDragY] = useState(0);
  const [phase, setPhase] = useState<'idle' | 'dragging' | 'settling' | 'closing'>('idle');
  const drag = useRef<{ id: number; startY: number; lastY: number; lastT: number; velocity: number } | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && dismiss();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onClose]);

  // Lock the page behind the sheet so it can't scroll (iOS needs position: fixed, not just overflow).
  useEffect(() => {
    const { style } = document.body;
    const scrollY = window.scrollY;
    const previous = { position: style.position, top: style.top, width: style.width, overflow: style.overflow };
    style.position = 'fixed';
    style.top = `-${scrollY}px`;
    style.width = '100%';
    style.overflow = 'hidden';
    return () => {
      style.position = previous.position;
      style.top = previous.top;
      style.width = previous.width;
      style.overflow = previous.overflow;
      window.scrollTo(0, scrollY);
    };
  }, []);

  /** Slide out, then unmount. */
  function dismiss() {
    if (phase === 'closing') return;
    setPhase('closing');
    setDragY(sheet.current?.offsetHeight ?? window.innerHeight);
    window.setTimeout(onClose, 260);
  }

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (phase === 'closing') return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    const target = e.target as HTMLElement;
    // Buttons, inputs and scrollable lists keep their own gestures.
    if (target.closest('button, input, a, .history')) return;
    drag.current = { id: e.pointerId, startY: e.clientY, lastY: e.clientY, lastT: e.timeStamp, velocity: 0 };
    setPhase('dragging');
    e.currentTarget.setPointerCapture?.(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const d = drag.current;
    if (!d || e.pointerId !== d.id) return;
    const dt = Math.max(1, e.timeStamp - d.lastT);
    d.velocity = (e.clientY - d.lastY) / dt;
    d.lastY = e.clientY;
    d.lastT = e.timeStamp;
    const dy = e.clientY - d.startY;
    // Follow the finger downwards; resist upwards like iOS rubber-banding.
    setDragY(dy >= 0 ? dy : dy / 6);
  }

  function onPointerUp(e: React.PointerEvent<HTMLDivElement>) {
    const d = drag.current;
    if (!d || e.pointerId !== d.id) return;
    drag.current = null;
    const dy = e.clientY - d.startY;
    const height = sheet.current?.offsetHeight ?? 400;
    const flick = d.velocity > 0.5; // px per ms
    if (dy > height * 0.45 || (flick && dy > 40)) {
      dismiss();
      return;
    }
    setPhase('settling');
    setDragY(0);
  }

  const transform = dragY ? `translateY(${dragY}px)` : undefined;

  return (
    <div className={`backdrop${phase === 'closing' ? ' closing' : ''}`} onClick={dismiss}>
      <div
        ref={sheet}
        className={`dialog ${phase}${className ? ` ${className}` : ''}`}
        role={role}
        aria-modal="true"
        aria-labelledby={labelledBy}
        style={transform ? { transform } : undefined}
        onClick={(e) => e.stopPropagation()}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div className="sheet-handle">
          <span aria-hidden="true" />
        </div>
        {children}
      </div>
    </div>
  );
}
