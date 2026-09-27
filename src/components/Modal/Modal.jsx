import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

const FOCUSABLE = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function Modal({ title, description, onClose, children, footer, size = 'md' }) {
  const dialogRef = useRef(null);
  const closeRef = useRef(onClose);

  useEffect(() => { closeRef.current = onClose; });

  useEffect(() => {
    const node = dialogRef.current;
    const previous = document.activeElement;
    (node.querySelector('[data-autofocus]') || node.querySelector(FOCUSABLE) || node).focus();

    const onKey = (e) => {
      if (e.key === 'Escape') { closeRef.current(); return; }
      if (e.key !== 'Tab') return;
      const items = [...node.querySelectorAll(FOCUSABLE)];
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      previous?.focus?.();
    };
  }, []);

  return createPortal(
    <div className="overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div
        ref={dialogRef}
        className={`modal modal--${size}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabIndex={-1}
      >
        <header className="modal__header">
          <div>
            <h2 id="modal-title" className="modal__title">{title}</h2>
            {description && <p className="modal__description">{description}</p>}
          </div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close dialog"><X size={18} /></button>
        </header>
        <div className="modal__body">{children}</div>
        {footer && <footer className="modal__footer">{footer}</footer>}
      </div>
    </div>,
    document.body,
  );
}

export function ConfirmDialog({ title, message, confirmLabel = 'Delete', busy = false, onConfirm, onCancel }) {
  return (
    <Modal
      title={title}
      size="sm"
      onClose={onCancel}
      footer={(
        <>
          <button type="button" className="btn btn--secondary" onClick={onCancel} data-autofocus>Cancel</button>
          <button type="button" className="btn btn--danger" onClick={onConfirm} disabled={busy}>
            {busy ? 'Working…' : confirmLabel}
          </button>
        </>
      )}
    >
      <p className="modal__text">{message}</p>
    </Modal>
  );
}
