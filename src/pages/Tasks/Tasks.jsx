import { useMemo, useState } from 'react';
import { LayoutGrid, List, ListChecks, Plus } from 'lucide-react';
import { useProjectContext } from '../../hooks/useProjectContext';
import { useToast } from '../../context/ToastContext';
import { tasksApi } from '../../services/api';
import { EmptyState, SegmentedControl } from '../../components/ui';
import KanbanBoard from '../../components/KanbanBoard/KanbanBoard';
import TaskTable from '../../components/TaskTable/TaskTable';
import TaskFormModal from '../../components/forms/TaskFormModal';

const VIEWS = [
  { value: 'board', label: 'Board', icon: LayoutGrid },
  { value: 'list', label: 'List', icon: List },
];

export default function TasksTab() {
  const { project, canManage, reload, patchTask } = useProjectContext();
  const toast = useToast();
  const [view, setView] = useState('board');
  const [draft, setDraft] = useState(null); // { task? }
  const milestonesById = useMemo(() => Object.fromEntries(project.milestones.map((m) => [m.id, m])), [project.milestones]);
  const membersById = useMemo(() => Object.fromEntries(project.members.map((m) => [m.id, m])), [project.members]);
  const noMilestones = project.milestones.length === 0;

  const move = async (taskId, status) => {
    const task = project.tasks.find((t) => t.id === taskId);
    if (!task || task.status === status) return;
    patchTask(taskId, { status });
    try {
      await tasksApi.update(taskId, { status });
    } catch (err) {
      toast.error(err.message);
    }
    reload({ silent: true });
  };

  const newTaskButton = (
    <button type="button" className="btn btn--primary" onClick={() => setDraft({})} disabled={noMilestones} title={noMilestones ? 'Create a milestone first' : undefined}>
      <Plus size={17} /> New task
    </button>
  );

  return (
    <div className="tab-panel">
      <div className="tab-panel__head">
        <div>
          <h2 className="section__title">Tasks</h2>
          <p className="muted">
            {canManage ? 'Drag cards between columns or use the status menu to update progress.' : 'Tasks assigned to the team. Supervisors can view but not edit them.'}
          </p>
        </div>
        <div className="tab-panel__actions">
          <SegmentedControl label="Task view" value={view} onChange={setView} options={VIEWS} />
          {canManage && newTaskButton}
        </div>
      </div>

      {noMilestones && canManage && (
        <div className="alert alert--info" role="status">Tasks belong to milestones. Create a milestone first, then add tasks to it.</div>
      )}

      {project.tasks.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={ListChecks}
            title="No tasks yet"
            message={canManage ? 'Add tasks to your milestones and assign them to team members.' : 'The team has not added any tasks yet.'}
          />
        </div>
      ) : view === 'board' ? (
        <KanbanBoard tasks={project.tasks} milestonesById={milestonesById} membersById={membersById} canEdit={canManage} onOpen={(task) => setDraft({ task })} onMove={move} />
      ) : (
        <TaskTable tasks={project.tasks} milestonesById={milestonesById} membersById={membersById} canEdit={canManage} onOpen={(task) => setDraft({ task })} onStatusChange={move} />
      )}

      {draft && (
        <TaskFormModal
          project={project}
          task={draft.task}
          readOnly={!canManage}
          onClose={() => setDraft(null)}
          onSaved={() => { setDraft(null); reload({ silent: true }); }}
        />
      )}
    </div>
  );
}
