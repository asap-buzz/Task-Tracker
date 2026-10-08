import { useEffect } from 'react';
import { X, Loader2, Inbox } from 'lucide-react';
import { cap } from '../utils/format.js';

export const Spinner = ({ label = 'Loading' }) => (
  <div className="center-box" role="status"><Loader2 className="spin" size={22} /><span className="sr-only">{label}</span></div>
);
export const ErrorBox = ({ message, onRetry }) => (
  <div className="alert alert--error" role="alert">{message}{onRetry && <button className="btn btn--ghost btn--sm" onClick={onRetry}>Retry</button>}</div>
);
export const EmptyState = ({ title, text, action }) => (
  <div className="empty"><Inbox size={28} /><h3>{title}</h3>{text && <p>{text}</p>}{action}</div>
);
export const Badge = ({ kind, children }) => <span className={`badge badge--${kind || 'default'}`}>{children ?? cap(kind)}</span>;

export function XPBar({ progress }) {
  return (
    <div>
      <div className="xp-meta"><span>Level {progress.level}</span><span>{progress.xpIntoLevel} / {progress.xpForNextLevel} XP</span></div>
      <div className="progress" role="progressbar" aria-valuenow={progress.percent} aria-valuemin={0} aria-valuemax={100}>
        <div className="progress__fill" style={{ width: `${progress.percent}%` }} />
      </div>
    </div>
  );
}

export function Modal({ title, onClose, children }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={title}>
        <div className="modal__head"><h2>{title}</h2><button className="icon-btn" onClick={onClose} aria-label="Close"><X size={18} /></button></div>
        {children}
      </div>
    </div>
  );
}

export function ConfirmDialog({ title, message, confirmLabel = 'Delete', busy, onConfirm, onClose }) {
  return (
    <Modal title={title} onClose={onClose}>
      <p className="muted">{message}</p>
      <div className="row row--end">
        <button className="btn btn--secondary" onClick={onClose}>Cancel</button>
        <button className="btn btn--danger" onClick={onConfirm} disabled={busy}>{busy ? 'Working…' : confirmLabel}</button>
      </div>
    </Modal>
  );
}

export const Field = ({ label, error, children }) => (
  <label className="field"><span>{label}</span>{children}{error && <small className="field__error">{error}</small>}</label>
);
