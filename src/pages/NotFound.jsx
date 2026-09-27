import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { homePathFor } from '../utils/constants';

export default function NotFoundPage() {
  const { user } = useAuth();
  return (
    <div className="not-found">
      <h1>Page not found</h1>
      <p>The page you are looking for does not exist or has moved.</p>
      <Link className="btn btn--primary" to={user ? homePathFor(user.role) : '/login'}>{user ? 'Go to dashboard' : 'Go to log in'}</Link>
    </div>
  );
}
