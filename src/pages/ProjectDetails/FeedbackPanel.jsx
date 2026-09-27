import { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { feedbackApi } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { formatDateTime } from '../../utils/dates';
import { Avatar, EmptyState, TextField } from '../../components/ui';

export default function FeedbackPanel({ project, canPost, onPosted }) {
  const toast = useToast();
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!message.trim()) { setError('Write a message before posting.'); return; }
    setError('');
    setBusy(true);
    try {
      await feedbackApi.create(project.id, message.trim());
      setMessage('');
      toast.success('Feedback posted.');
      onPosted();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="card" id="feedback">
      <header className="card__header"><h2 className="card__title">Supervisor feedback</h2></header>

      {canPost && (
        <form className="form feedback-form" onSubmit={submit} noValidate>
          <TextField as="textarea" rows={3} label="Add feedback for the team" id="feedback-message" value={message} onChange={(e) => setMessage(e.target.value)} error={error} />
          <div><button type="submit" className="btn btn--primary" disabled={busy}>{busy ? 'Posting…' : 'Post feedback'}</button></div>
        </form>
      )}

      {project.feedback.length === 0 ? (
        <EmptyState compact icon={MessageSquare} title="No feedback yet" message={canPost ? 'Your feedback will appear here for the whole team to see.' : 'Your supervisor has not left feedback on this project yet.'} />
      ) : (
        <ul className="feedback-list">
          {project.feedback.map((f) => (
            <li key={f.id} className="feedback">
              <Avatar name={f.supervisorName} />
              <div>
                <div className="feedback__head">
                  <strong>{f.supervisorName}</strong>
                  <time dateTime={f.createdAt}>{formatDateTime(f.createdAt)}</time>
                </div>
                <p className="feedback__text">{f.message}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
