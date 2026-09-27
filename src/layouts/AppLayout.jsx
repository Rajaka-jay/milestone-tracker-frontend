import { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useNotifications } from '../hooks/useNotifications';
import Navbar from '../components/Navbar/Navbar';
import Sidebar from '../components/Sidebar/Sidebar';

const COLLAPSE_KEY = 'smt_sidebar_collapsed';
const readCollapsed = () => {
  try { return localStorage.getItem(COLLAPSE_KEY) === 'true'; } catch { return false; }
};

export default function AppLayout() {
  const { user, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const notifications = useNotifications(true);
  const [collapsed, setCollapsed] = useState(readCollapsed);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const toggleSidebar = () => {
    if (window.matchMedia('(max-width: 900px)').matches) {
      setMobileOpen((v) => !v);
      return;
    }
    setCollapsed((prev) => {
      try { localStorage.setItem(COLLAPSE_KEY, String(!prev)); } catch { /* storage unavailable */ }
      return !prev;
    });
  };

  const respond = async (notification, accept) => {
    try {
      const result = await notifications.respond(notification.id, accept);
      if (result.accepted) {
        toast.success('You joined the project team.');
        setNotificationsOpen(false);
        navigate(`/projects/${result.projectId}`);
      } else {
        toast.success('Invitation declined.');
      }
    } catch (err) {
      toast.error(err.message);
      notifications.reload();
    }
  };

  return (
    <div className="app">
      <Navbar
        user={user}
        onToggleSidebar={toggleSidebar}
        notifications={notifications}
        notificationsOpen={notificationsOpen}
        onNotificationsOpenChange={setNotificationsOpen}
        onMarkRead={notifications.markRead}
        onMarkAllRead={notifications.markAllRead}
        onRespond={respond}
        onLogout={logout}
      />
      <Sidebar
        role={user.role}
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        unreadCount={notifications.unreadCount}
        onOpenNotifications={() => setNotificationsOpen(true)}
        onNavigate={() => setMobileOpen(false)}
        onLogout={logout}
      />
      {mobileOpen && <button type="button" className="scrim" aria-label="Close navigation menu" onClick={() => setMobileOpen(false)} />}
      <main className={`app__main ${collapsed ? 'is-collapsed' : ''}`}>
        <Outlet />
      </main>
    </div>
  );
}
