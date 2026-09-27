import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, GraduationCap, ChevronDown, User, LogOut } from 'lucide-react';
import { useDismiss } from '../../hooks/useDismiss';
import { homePathFor } from '../../utils/constants';
import { Avatar } from '../ui';
import GlobalSearch from '../GlobalSearch/GlobalSearch';
import NotificationBell from '../NotificationBell/NotificationBell';

function ProfileMenu({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useDismiss(ref, open, () => setOpen(false));

  return (
    <div className="profile-menu" ref={ref}>
      <button type="button" className="profile-menu__trigger" aria-haspopup="true" aria-expanded={open} onClick={() => setOpen(!open)}>
        <Avatar name={user.fullName} size="sm" />
        <span className="profile-menu__name">{user.fullName}</span>
        <ChevronDown size={15} />
      </button>
      {open && (
        <div className="dropdown profile-menu__panel">
          <div className="profile-menu__who">
            <strong>{user.fullName}</strong>
            <span>{user.email}</span>
            <span className="profile-menu__role">{user.role === 'supervisor' ? 'Project supervisor' : 'Student'}</span>
          </div>
          <Link to="/profile" className="dropdown__item" onClick={() => setOpen(false)}><User size={16} /> Profile</Link>
          <button type="button" className="dropdown__item" onClick={onLogout}><LogOut size={16} /> Log out</button>
        </div>
      )}
    </div>
  );
}

export default function Navbar({ user, onToggleSidebar, notifications, notificationsOpen, onNotificationsOpenChange, onMarkRead, onMarkAllRead, onRespond, onLogout }) {
  return (
    <header className="topbar">
      <button type="button" className="icon-btn" onClick={onToggleSidebar} aria-label="Toggle navigation menu">
        <Menu size={20} />
      </button>
      <Link to={homePathFor(user.role)} className="brand">
        <span className="brand__mark"><GraduationCap size={19} /></span>
        <span className="brand__text">
          <strong>Milestone Tracker</strong>
          <small>Student projects</small>
        </span>
      </Link>
      <GlobalSearch />
      <div className="topbar__actions">
        <NotificationBell
          notifications={notifications}
          open={notificationsOpen}
          onOpenChange={onNotificationsOpenChange}
          onMarkRead={onMarkRead}
          onMarkAllRead={onMarkAllRead}
          onRespond={onRespond}
        />
        <ProfileMenu user={user} onLogout={onLogout} />
      </div>
    </header>
  );
}
