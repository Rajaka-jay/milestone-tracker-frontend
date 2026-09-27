import { useState } from 'react';
import { Copy, Check, Link2 } from 'lucide-react';
import { projectsApi } from '../../services/api';
import { useFetch } from '../../hooks/useFetch';
import { useToast } from '../../context/ToastContext';
import { buildInviteUrl } from '../../utils/constants';
import StudentSearch from '../../components/forms/StudentSearch';

export default function InvitePanel({ project, onInvited }) {
  const toast = useToast();
  const { data } = useFetch(() => projectsApi.inviteLink(project.id), [project.id]);
  const [copied, setCopied] = useState(false);
  const url = data ? buildInviteUrl(data.token) : '';

  const invite = async (student) => {
    try {
      await projectsApi.invite(project.id, student.id);
      toast.success(`Invitation sent to ${student.fullName}.`);
      onInvited();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Copy is not available here. Select the link and copy it manually.');
    }
  };

  return (
    <section className="card">
      <header className="card__header">
        <h2 className="card__title">Invite students</h2>
        <p className="card__subtitle">Invited students see a notification and can accept or decline.</p>
      </header>
      <div className="invite">
        <StudentSearch id="team-invite-search" projectId={project.id} actionLabel="Invite" onPick={invite} />
        <div className="invite__link">
          <label className="field__label" htmlFor="invite-link"><Link2 size={14} /> Invitation link</label>
          <div className="input-wrap">
            <input id="invite-link" className="input" readOnly value={url} placeholder="Generating link…" onFocus={(e) => e.target.select()} />
            <button type="button" className="btn btn--secondary btn--sm input-wrap__action" onClick={copy} disabled={!url}>
              {copied ? <><Check size={15} /> Copied</> : <><Copy size={15} /> Copy</>}
            </button>
          </div>
          <p className="field__hint">Anyone with a student account who opens this link joins the team.</p>
        </div>
      </div>
    </section>
  );
}
