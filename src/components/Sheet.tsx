import { useEffect, useRef, useState, type ReactNode } from 'react';

interface Props {
  labelledBy: string;
  role?: 'dialog' | 'alertdialog';
  className?: string;
  children: ReactNode;
  onClose: () => void;
}

const DISMISS_DISTANCE = 90;

/**
 * Bottom sheet. Closes on Escape, a tap outside, or dragging it down past a
 * threshold (anything shorter springs back).
 */
export default function Sheet({ labelledBy, role = 'dialog', className, children, onClose }: Props) {
  const [dragY, setDragY] = useState(0);
  const [settling, setSettling] = useState(false);
  const start = useRef<{ y: number; id: number } | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
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

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    // Only start a drag from the handle area so buttons and scrolling lists behave normally.
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    start.current = { y: e.clientY, id: e.pointerId };
    setSettling(false);
    e.currentTarget.setPointerCapture?.(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!start.current || e.pointerId !== start.current.id) return;
    setDragY(Math.max(0, e.clientY - start.current.y));
  }

  function onPointerUp(e: React.PointerEvent<HTMLDivElement>) {
    if (!start.current || e.pointerId !== start.current.id) return;
    const dy = e.clientY - start.current.y;
    start.current = null;
    if (dy > DISMISS_DISTANCE) {
      onClose();
      return;
    }
    setSettling(true);
    setDragY(0);
  }

  return (
    <div className="backdrop" onClick={onClose}>
      <div
        className={`dialog${className ? ` ${className}` : ''}${settling ? ' settling' : ''}`}
        role={role}
        aria-modal="true"
        aria-labelledby={labelledBy}
        style={dragY ? { transform: `translateY(${dragY}px)` } : undefined}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="sheet-handle"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <span aria-hidden="true" />
        </div>
        {children}
      </div>
    </div>
  );
}
