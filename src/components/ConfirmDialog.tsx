import { useEffect, useRef, type ReactNode } from 'react';
import Sheet from './Sheet';

interface Props {
  title: string;
  confirmLabel: string;
  danger?: boolean;
  children: ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({ title, confirmLabel, danger, children, onConfirm, onCancel }: Props) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  useEffect(() => cancelRef.current?.focus(), []);

  return (
    <Sheet role="alertdialog" labelledBy="dialog-title" onClose={onCancel}>
      <h2 id="dialog-title">{title}</h2>
      <p id="dialog-body">{children}</p>
      <div className="dialog-actions">
        <button ref={cancelRef} className="btn btn-ghost" onClick={onCancel}>
          Cancel
        </button>
        <button className={danger ? 'btn btn-danger' : 'btn btn-primary'} onClick={onConfirm}>
          {confirmLabel}
        </button>
      </div>
    </Sheet>
  );
}
