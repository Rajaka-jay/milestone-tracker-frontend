import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PageLoader } from '../components/ui';
import { homePathFor } from '../utils/constants';

/**
 * Blocks unauthenticated visitors and users whose role is not allowed.
 * Use as a layout route: <Route element={<ProtectedRoute roles={['student']} />}>…</Route>
 */
export default function ProtectedRoute({ roles, children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <PageLoader label="Checking your session…" />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (roles && !roles.includes(user.role)) return <Navigate to={homePathFor(user.role)} replace />;
  return children ?? <Outlet />;
}

/** Sends signed-in users away from the login and register pages. */
export function PublicOnlyRoute() {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (user) return <Navigate to={homePathFor(user.role)} replace />;
  return <Outlet />;
}

export function HomeRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  return <Navigate to={user ? homePathFor(user.role) : '/login'} replace />;
}
