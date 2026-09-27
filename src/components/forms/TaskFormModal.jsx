import { useState } from 'react';
import { tasksApi } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { validateTask } from '../../utils/validators';
import { PRIORITIES, TASK_STATUSES } from '../../utils/constants';
import Modal from '../Modal/Modal';
import { TextField } from '../ui';

/** Create a task (task = null) or edit / inspect an existing one. */
export default function TaskFormModal({ project, task = null, presetMilestoneId = '', readOnly = false, onClose, onSaved }) {
  const toast = useToast();
  const editing = Boolean(task);
  const [values, setValues] = useState({
    title: task?.title ?? '',
    description: task?.description ?? '',
    milestoneId: task?.milestoneId ?? presetMilestoneId,
    assigneeId: task?.assigneeId ?? '',
    deadline: task?.deadline ?? '',
    priority: task?.priority ?? 'medium',
    status: task?.status ?? 'todo',
  });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (field) => (e) => setValues((v) => ({ ...v, [field]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (readOnly) return;
    const found = validateTask(values);
    setErrors(found);
    setFormError('');
    if (Object.keys(found).length) return;
    setBusy(true);
    try {
      if (editing) await tasksApi.update(task.id, values);
      else await tasksApi.create(project.id, values);
      toast.success(editing ? 'Task updated.' : 'Task created.');
      onSaved();
    } catch (err) {
      setErrors(err.details || {});
      setFormError(err.message);
      setBusy(false);
    }
  };

  return (
    <Modal
      title={readOnly ? 'Task details' : editing ? 'Edit task' : 'New task'}
      size="lg"
      onClose={onClose}
      footer={readOnly ? (
        <button type="button" className="btn btn--secondary" onClick={onClose}>Close</button>
      ) : (
        <>
          <button type="button" className="btn btn--secondary" onClick={onClose}>Cancel</button>
          <button type="submit" form="task-form" className="btn btn--primary" disabled={busy}>{busy ? 'Saving…' : editing ? 'Save changes' : 'Create task'}</button>
        </>
      )}
    >
      {formError && <div className="alert alert--error" role="alert">{formError}</div>}
      <form id="task-form" className="form" onSubmit={submit} noValidate>
        <fieldset className="form__fieldset" disabled={readOnly}>
          <TextField label="Task title" id="task-title" required value={values.title} onChange={set('title')} error={errors.title} data-autofocus />
          <TextField as="textarea" rows={3} label="Description" id="task-description" value={values.description} onChange={set('description')} />
          <div className="form__row">
            <TextField as="select" label="Milestone" id="task-milestone" required value={values.milestoneId} onChange={set('milestoneId')} error={errors.milestoneId}>
              <option value="">Select a milestone</option>
              {project.milestones.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </TextField>
            <TextField as="select" label="Assignee" id="task-assignee" required value={values.assigneeId} onChange={set('assigneeId')} error={errors.assigneeId}>
              <option value="">Select a team member</option>
              {project.members.map((m) => <option key={m.id} value={m.id}>{m.fullName}</option>)}
            </TextField>
          </div>
          <div className="form__row form__row--3">
            <TextField label="Deadline" id="task-deadline" type="date" required value={values.deadline} onChange={set('deadline')} error={errors.deadline} />
            <TextField as="select" label="Priority" id="task-priority" value={values.priority} onChange={set('priority')}>
              {PRIORITIES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
            </TextField>
            <TextField as="select" label="Status" id="task-status" value={values.status} onChange={set('status')}>
              {TASK_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </TextField>
          </div>
        </fieldset>
      </form>
    </Modal>
  );
}
