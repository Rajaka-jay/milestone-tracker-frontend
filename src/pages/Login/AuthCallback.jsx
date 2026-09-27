import { useEffect, useRef, useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { homePathFor } from '../../utils/constants';
import { PageLoader } from '../../components/ui';

/** Landing page for the backend's Google OAuth redirect: /auth/callback?token=... */
export default function AuthCallback() {
  const [params] = useSearchParams();
  const { completeLogin } = useAuth();
  const navigate = useNavigate();
  const [failed, setFailed] = useState(false);
  const started = useRef(false);
  const token = params.get('token');

  useEffect(() => {
    if (!token || started.current) return;
    started.current = true;
    completeLogin(token)
      .then((user) => navigate(homePathFor(user.role), { replace: true }))
      .catch(() => setFailed(true));
  }, [token, completeLogin, navigate]);

  if (!token || failed) return <Navigate to="/login" replace />;
  return <PageLoader label="Signing you in…" />;
}
