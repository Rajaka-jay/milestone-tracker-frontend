import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { validateLogin } from '../../utils/validators';
import { homePathFor } from '../../utils/constants';
import { USE_MOCK } from '../../config';
import { TextField } from '../../components/ui';

export function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.6 5.9c4.4-4.1 7-10.1 7-17.6z" />
      <path fill="#FBBC05" d="M10.5 28.7A14.5 14.5 0 0 1 9.5 24c0-1.6.3-3.2.8-4.7l-7.9-6.1A24 24 0 0 0 0 24c0 3.9.9 7.5 2.6 10.8l7.9-6.1z" />
      <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.6-5.9c-2.1 1.4-4.9 2.3-8.3 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z" />
    </svg>
  );
}

export default function LoginPage() {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [values, setValues] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);

  const set = (field) => (e) => setValues((v) => ({ ...v, [field]: e.target.value }));

  const finish = (user) => {
    if (!user) return;
    const from = location.state?.from;
    navigate(from && user.role === 'student' ? from : homePathFor(user.role), { replace: true });
  };

  const submit = async (e) => {
    e.preventDefault();
    const found = validateLogin(values);
    setErrors(found);
    setFormError('');
    if (Object.keys(found).length) return;
    setBusy(true);
    try {
      finish(await login(values.email, values.password));
    } catch (err) {
      setFormError(err.message);
      setBusy(false);
    }
  };

  const google = async () => {
    setFormError('');
    try { finish(await loginWithGoogle()); } catch (err) { setFormError(err.message); }
  };

  const fill = (email) => setValues({ email, password: 'password123' });

  return (
    <div className="auth-card">
      <h1 className="auth-card__title">Log in</h1>
      <p className="auth-card__subtitle">Use your university account to continue.</p>

      {formError && <div className="alert alert--error" role="alert">{formError}</div>}

      <form onSubmit={submit} noValidate className="form">
        <TextField label="Email" id="login-email" type="email" autoComplete="email" value={values.email} onChange={set('email')} error={errors.email} />
        <div className="field">
          <div className="field__row">
            <label className="field__label" htmlFor="login-password">Password</label>
            <Link to="/forgot-password" className="link">Forgot password?</Link>
          </div>
          <div className="input-wrap">
            <input
              id="login-password"
              className={`input ${errors.password ? 'input--error' : ''}`}
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={values.password}
              onChange={set('password')}
              aria-invalid={errors.password ? 'true' : undefined}
              aria-describedby={errors.password ? 'login-password-error' : undefined}
            />
            <button type="button" className="input-wrap__btn" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
          {errors.password && <p className="field__error" id="login-password-error" role="alert">{errors.password}</p>}
        </div>
        <button type="submit" className="btn btn--primary btn--block" disabled={busy}>{busy ? 'Logging in…' : 'Login'}</button>
      </form>

      <div className="divider"><span>or</span></div>
      <button type="button" className="btn btn--secondary btn--block" onClick={google}>
        <GoogleMark /> Continue with Google
      </button>

      <p className="auth-card__switch">New to Milestone Tracker? <Link to="/register" className="link">Create an account</Link></p>

      {USE_MOCK && (
        <div className="demo-box">
          <strong>Demo accounts</strong>
          <p>The password for both is <code>password123</code>.</p>
          <div className="demo-box__actions">
            <button type="button" className="btn btn--secondary btn--sm" onClick={() => fill('amina@student.edu')}>Fill student login</button>
            <button type="button" className="btn btn--secondary btn--sm" onClick={() => fill('supervisor@uni.edu')}>Fill supervisor login</button>
          </div>
        </div>
      )}
    </div>
  );
}
