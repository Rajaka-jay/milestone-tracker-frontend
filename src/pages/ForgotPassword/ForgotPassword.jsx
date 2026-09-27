import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { authApi } from '../../services/api';
import { isEmail } from '../../utils/validators';
import { TextField } from '../../components/ui';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!isEmail(email)) { setError('Enter the email address you registered with.'); return; }
    setError('');
    setBusy(true);
    try {
      const res = await authApi.forgotPassword(email.trim());
      setMessage(res.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-card">
      <h1 className="auth-card__title">Reset your password</h1>
      <p className="auth-card__subtitle">Enter your email and we'll send you a link to choose a new password.</p>
      {message ? (
        <div className="alert alert--success" role="status"><CheckCircle2 size={18} /> {message}</div>
      ) : (
        <form onSubmit={submit} noValidate className="form">
          <TextField label="Email" id="forgot-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} error={error} />
          <button type="submit" className="btn btn--primary btn--block" disabled={busy}>{busy ? 'Sending…' : 'Send reset link'}</button>
        </form>
      )}
      <p className="auth-card__switch"><Link to="/login" className="link">Back to log in</Link></p>
    </div>
  );
}
