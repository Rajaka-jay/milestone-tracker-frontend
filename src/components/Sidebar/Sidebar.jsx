import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, Bell, Settings, LogOut } from 'lucide-react';

const NAV = {
  student: [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/projects', label: 'My Projects', icon: FolderKanban },
  ],
  supervisor: [
    { to: '/supervisor', label: 'Dashboard', icon: LayoutDashboard },
  ],
};

export default function Sidebar({ role, collapsed, mobileOpen, unreadCount, onOpenNotifications, onNavigate, onLogout }) {
  const items = NAV[role] ?? NAV.student;
  const cls = ['sidebar', collapsed ? 'sidebar--collapsed' : '', mobileOpen ? 'is-open' : ''].join(' ');

  return (
    <aside className={cls} aria-label="Main navigation">
      <nav className="sidebar__nav">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} title={label} className="sidebar__link" onClick={onNavigate}>
            <Icon size={19} />
            <span className="sidebar__label">{label}</span>
          </NavLink>
        ))}
        <button type="button" className="sidebar__link" title="Notifications" onClick={() => { onNavigate?.(); onOpenNotifications(); }}>
          <span className="sidebar__icon-wrap">
            <Bell size={19} />
            {unreadCount > 0 && <span className="sidebar__dot" aria-hidden="true" />}
          </span>
          <span className="sidebar__label">Notifications</span>
          {unreadCount > 0 && <span className="sidebar__count">{unreadCount}</span>}
        </button>
        <NavLink to="/profile" title="Settings and profile" className="sidebar__link" onClick={onNavigate}>
          <Settings size={19} />
          <span className="sidebar__label">Settings / Profile</span>
        </NavLink>
      </nav>
      <div className="sidebar__footer">
        <button type="button" className="sidebar__link" title="Log out" onClick={onLogout}>
          <LogOut size={19} />
          <span className="sidebar__label">Log out</span>
        </button>
      </div>
    </aside>
  );
}
