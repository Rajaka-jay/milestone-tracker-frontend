import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, BookOpen } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { validateRegister } from '../../utils/validators';
import { homePathFor } from '../../utils/constants';
import { TextField } from '../../components/ui';

const ROLES = [
  { value: 'student', label: 'Student', hint: 'Create projects and track team tasks', icon: GraduationCap },
  { value: 'supervisor', label: 'Supervisor', hint: 'Monitor projects and give feedback', icon: BookOpen },
];

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [values, setValues] = useState({ fullName: '', email: '', password: '', confirmPassword: '', role: 'student' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (field) => (e) => setValues((v) => ({ ...v, [field]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    const found = validateRegister(values);
    setErrors(found);
    setFormError('');
    if (Object.keys(found).length) return;
    setBusy(true);
    try {
      const user = await register({ fullName: values.fullName.trim(), email: values.email, password: values.password, role: values.role });
      navigate(homePathFor(user.role), { replace: true });
    } catch (err) {
      setErrors(err.details || {});
      setFormError(err.message);
      setBusy(false);
    }
  };

  return (
    <div className="auth-card">
      <h1 className="auth-card__title">Create your account</h1>
      <p className="auth-card__subtitle">It takes less than a minute.</p>
      {formError && <div className="alert alert--error" role="alert">{formError}</div>}

      <form onSubmit={submit} noValidate className="form">
        <TextField label="Full name" id="reg-name" autoComplete="name" value={values.fullName} onChange={set('fullName')} error={errors.fullName} />
        <TextField label="Email" id="reg-email" type="email" autoComplete="email" value={values.email} onChange={set('email')} error={errors.email} />
        <div className="form__row">
          <TextField label="Password" id="reg-password" type="password" autoComplete="new-password" value={values.password} onChange={set('password')} error={errors.password} hint="At least 8 characters." />
          <TextField label="Confirm password" id="reg-confirm" type="password" autoComplete="new-password" value={values.confirmPassword} onChange={set('confirmPassword')} error={errors.confirmPassword} />
        </div>
        <fieldset className="role-picker">
          <legend className="field__label">I am a</legend>
          <div className="role-picker__options">
            {ROLES.map(({ value, label, hint, icon: Icon }) => (
              <label key={value} className={`role-option ${values.role === value ? 'is-selected' : ''}`}>
                <input type="radio" name="role" value={value} checked={values.role === value} onChange={set('role')} />
                <Icon size={20} />
                <span>
                  <strong>{label}</strong>
                  <small>{hint}</small>
                </span>
              </label>
            ))}
          </div>
          {errors.role && <p className="field__error" role="alert">{errors.role}</p>}
        </fieldset>
        <button type="submit" className="btn btn--primary btn--block" disabled={busy}>{busy ? 'Creating account…' : 'Create account'}</button>
      </form>
      <p className="auth-card__switch">Already registered? <Link to="/login" className="link">Log in</Link></p>
    </div>
  );
}
