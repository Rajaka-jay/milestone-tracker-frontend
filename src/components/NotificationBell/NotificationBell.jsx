import { useRef, useState } from 'react';
import { Bell, CalendarClock, FolderPlus, MessageSquare, Check } from 'lucide-react';
import { useDismiss } from '../../hooks/useDismiss';
import { timeAgo } from '../../utils/dates';
import { Spinner } from '../ui';

const ICONS = { invitation: FolderPlus, deadline: CalendarClock, feedback: MessageSquare };

export default function NotificationBell({ notifications, onMarkRead, onMarkAllRead, onRespond, open, onOpenChange }) {
  const ref = useRef(null);
  const [busyId, setBusyId] = useState(null);
  const { items, unreadCount, loading } = notifications;
  useDismiss(ref, open, () => onOpenChange(false));

  const respond = async (n, accept) => {
    setBusyId(n.id);
    try { await onRespond(n, accept); } finally { setBusyId(null); }
  };

  return (
    <div className="bell" ref={ref}>
      <button
        type="button"
        className="icon-btn"
        aria-label={unreadCount ? `Notifications, ${unreadCount} unread` : 'Notifications'}
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => onOpenChange(!open)}
      >
        <Bell size={20} />
        {unreadCount > 0 && <span className="bell__badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
      </button>

      {open && (
        <div className="dropdown bell__panel" role="region" aria-label="Notifications">
          <div className="dropdown__header">
            <strong>Notifications</strong>
            <button type="button" className="link-btn" onClick={onMarkAllRead} disabled={!unreadCount}>Mark all as read</button>
          </div>
          <div className="bell__list">
            {loading && <div className="bell__empty"><Spinner /></div>}
            {!loading && items.length === 0 && <p className="bell__empty">You're all caught up.</p>}
            {items.map((n) => {
              const Icon = ICONS[n.type] || Bell;
              const pending = n.type === 'invitation' && n.invitationStatus === 'pending';
              return (
                <div key={n.id} className={`bell__item ${n.read ? '' : 'is-unread'}`}>
                  <span className={`bell__icon bell__icon--${n.type}`}><Icon size={16} /></span>
                  <div className="bell__content">
                    <p className="bell__message">{n.message}</p>
                    <span className="bell__time">{timeAgo(n.createdAt)}</span>
                    {pending && (
                      <div className="bell__actions">
                        <button type="button" className="btn btn--primary btn--sm" disabled={busyId === n.id} onClick={() => respond(n, true)}>Accept</button>
                        <button type="button" className="btn btn--secondary btn--sm" disabled={busyId === n.id} onClick={() => respond(n, false)}>Decline</button>
                      </div>
                    )}
                    {n.type === 'invitation' && n.invitationStatus && !pending && (
                      <span className="bell__status">Invitation {n.invitationStatus}</span>
                    )}
                  </div>
                  {!n.read && (
                    <button type="button" className="icon-btn icon-btn--sm" aria-label="Mark as read" title="Mark as read" onClick={() => onMarkRead(n.id)}>
                      <Check size={15} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
