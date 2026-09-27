import { useState } from 'react';
import { X } from 'lucide-react';
import { projectsApi, usersApi } from '../../services/api';
import { useFetch } from '../../hooks/useFetch';
import { useToast } from '../../context/ToastContext';
import { validateProject } from '../../utils/validators';
import { todayISO } from '../../utils/dates';
import Modal from '../Modal/Modal';
import StudentSearch from './StudentSearch';
import { Avatar, TextField } from '../ui';

export default function ProjectFormModal({ onClose, onCreated }) {
  const toast = useToast();
  const { data: supervisorList } = useFetch(() => usersApi.supervisors(), []);
  const supervisors = supervisorList ?? [];
  const [values, setValues] = useState({ title: '', description: '', supervisorId: '', startDate: todayISO(), endDate: '' });
  const [invitees, setInvitees] = useState([]);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (field) => (e) => setValues((v) => ({ ...v, [field]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    const found = validateProject(values);
    setErrors(found);
    setFormError('');
    if (Object.keys(found).length) return;
    setBusy(true);
    try {
      const project = await projectsApi.create({ ...values, inviteeIds: invitees.map((i) => i.id) });
      toast.success(invitees.length ? `Project created. ${invitees.length} invitation${invitees.length > 1 ? 's' : ''} sent.` : 'Project created.');
      onCreated(project);
    } catch (err) {
      setErrors(err.details || {});
      setFormError(err.message);
      setBusy(false);
    }
  };

  return (
    <Modal
      title="New project"
      description="You will be the project leader. Add milestones, tasks and documents once it is created."
      size="lg"
      onClose={onClose}
      footer={(
        <>
          <button type="button" className="btn btn--secondary" onClick={onClose}>Cancel</button>
          <button type="submit" form="project-form" className="btn btn--primary" disabled={busy}>{busy ? 'Creating…' : 'Create project'}</button>
        </>
      )}
    >
      {formError && <div className="alert alert--error" role="alert">{formError}</div>}
      <form id="project-form" className="form" onSubmit={submit} noValidate>
        <TextField label="Project title" id="project-title" required value={values.title} onChange={set('title')} error={errors.title} data-autofocus />
        <TextField as="textarea" rows={3} label="Description" id="project-description" required value={values.description} onChange={set('description')} error={errors.description} />
        <TextField as="select" label="Supervisor" id="project-supervisor" required value={values.supervisorId} onChange={set('supervisorId')} error={errors.supervisorId}>
          <option value="">Select a supervisor</option>
          {supervisors.map((s) => <option key={s.id} value={s.id}>{s.fullName}</option>)}
        </TextField>
        <div className="form__row">
          <TextField label="Start date" id="project-start" type="date" required value={values.startDate} onChange={set('startDate')} error={errors.startDate} />
          <TextField label="End date" id="project-end" type="date" required value={values.endDate} onChange={set('endDate')} error={errors.endDate} />
        </div>

        <div className="form__section">
          <StudentSearch id="project-invite-search" excludeIds={invitees.map((i) => i.id)} onPick={(s) => setInvitees((list) => [...list, s])} actionLabel="Invite" />
          {invitees.length > 0 && (
            <ul className="chips" aria-label="Students to invite">
              {invitees.map((i) => (
                <li key={i.id} className="chip">
                  <Avatar name={i.fullName} size="xs" />
                  {i.fullName}
                  <button type="button" aria-label={`Remove ${i.fullName}`} onClick={() => setInvitees((list) => list.filter((x) => x.id !== i.id))}><X size={13} /></button>
                </li>
              ))}
            </ul>
          )}
          <p className="field__hint">You can also share an invitation link from the Team tab after creating the project.</p>
        </div>
      </form>
    </Modal>
  );
}
