import { useState } from 'react';
import { milestonesApi } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { validateMilestone } from '../../utils/validators';
import { todayISO } from '../../utils/dates';
import Modal from '../Modal/Modal';
import { TextField } from '../ui';

export default function MilestoneFormModal({ project, onClose, onSaved }) {
  const toast = useToast();
  const [values, setValues] = useState({ name: '', description: '', startDate: todayISO() < project.startDate ? project.startDate : todayISO(), deadline: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (field) => (e) => setValues((v) => ({ ...v, [field]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    const found = validateMilestone(values, project);
    setErrors(found);
    setFormError('');
    if (Object.keys(found).length) return;
    setBusy(true);
    try {
      await milestonesApi.create(project.id, values);
      toast.success('Milestone created.');
      onSaved();
    } catch (err) {
      setErrors(err.details || {});
      setFormError(err.message);
      setBusy(false);
    }
  };

  return (
    <Modal
      title="New milestone"
      description="A milestone is a major stage of the project. Tasks are grouped under it."
      onClose={onClose}
      footer={(
        <>
          <button type="button" className="btn btn--secondary" onClick={onClose}>Cancel</button>
          <button type="submit" form="milestone-form" className="btn btn--primary" disabled={busy}>{busy ? 'Saving…' : 'Create milestone'}</button>
        </>
      )}
    >
      {formError && <div className="alert alert--error" role="alert">{formError}</div>}
      <form id="milestone-form" className="form" onSubmit={submit} noValidate>
        <TextField label="Milestone name" id="milestone-name" required value={values.name} onChange={set('name')} error={errors.name} data-autofocus />
        <TextField as="textarea" rows={3} label="Description" id="milestone-description" value={values.description} onChange={set('description')} error={errors.description} />
        <div className="form__row">
          <TextField label="Start date" id="milestone-start" type="date" required value={values.startDate} onChange={set('startDate')} error={errors.startDate} />
          <TextField label="Deadline" id="milestone-deadline" type="date" required value={values.deadline} onChange={set('deadline')} error={errors.deadline} />
        </div>
      </form>
    </Modal>
  );
}
