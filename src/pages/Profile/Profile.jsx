import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { authApi } from '../../services/api';
import { Avatar, Badge, PageHeader, TextField } from '../../components/ui';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const toast = useToast();
  const [fullName, setFullName] = useState(user.fullName);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!fullName.trim()) { setError('Enter your full name.'); return; }
    setError('');
    setBusy(true);
    try {
      updateUser(await authApi.updateProfile({ fullName: fullName.trim() }));
      toast.success('Profile updated.');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="page page--narrow">
      <PageHeader title="Settings / Profile" subtitle="Your account details." />
      <section className="card">
        <div className="profile-card">
          <Avatar name={user.fullName} size="xl" />
          <div>
            <h2 className="card__title">{user.fullName}</h2>
            <p className="muted">{user.email}</p>
            <Badge tone="blue">{user.role === 'supervisor' ? 'Project supervisor' : 'Student'}</Badge>
          </div>
        </div>
        <form className="form" onSubmit={submit} noValidate>
          <TextField label="Full name" id="profile-name" value={fullName} onChange={(e) => setFullName(e.target.value)} error={error} />
          <TextField label="Email" id="profile-email" value={user.email} readOnly hint="Your email address is managed by the university and cannot be changed here." />
          <div><button type="submit" className="btn btn--primary" disabled={busy || fullName.trim() === user.fullName}>{busy ? 'Saving…' : 'Save changes'}</button></div>
        </form>
      </section>
    </div>
  );
}
