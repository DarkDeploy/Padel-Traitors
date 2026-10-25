import '@testing-library/jest-dom/vitest';

// jsdom has no PointerEvent; give it one so pointer coordinates reach handlers.
if (typeof window.PointerEvent === 'undefined') {
  class PointerEvent extends MouseEvent {
    pointerId: number;
    pointerType: string;
    constructor(type: string, init: PointerEventInit = {}) {
      super(type, init);
      this.pointerId = init.pointerId ?? 0;
      this.pointerType = init.pointerType ?? 'touch';
    }
  }
  window.PointerEvent = PointerEvent as unknown as typeof window.PointerEvent;
}
