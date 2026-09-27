import { Loader2, AlertTriangle } from 'lucide-react';

export function Spinner({ label = 'Loading' }) {
  return <Loader2 className="spin" size={18} aria-label={label} />;
}

export function PageLoader({ label = 'Loading…' }) {
  return (
    <div className="page-loader" role="status">
      <Loader2 className="spin" size={24} />
      <span>{label}</span>
    </div>
  );
}

export function EmptyState({ icon: Icon, title, message, action, compact = false }) {
  return (
    <div className={`empty ${compact ? 'empty--compact' : ''}`}>
      {Icon && <span className="empty__icon"><Icon size={compact ? 20 : 26} /></span>}
      <h3 className="empty__title">{title}</h3>
      {message && <p className="empty__message">{message}</p>}
      {action}
    </div>
  );
}

export function ErrorState({ error, onRetry, title = 'This page could not be loaded' }) {
  return (
    <div className="empty empty--error" role="alert">
      <span className="empty__icon"><AlertTriangle size={26} /></span>
      <h3 className="empty__title">{title}</h3>
      <p className="empty__message">{error?.message || 'Something went wrong.'}</p>
      {onRetry && <button type="button" className="btn btn--secondary" onClick={() => onRetry()}>Try again</button>}
    </div>
  );
}
