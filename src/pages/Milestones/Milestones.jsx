import { useMemo, useState } from 'react';
import { Flag, Plus } from 'lucide-react';
import { useProjectContext } from '../../hooks/useProjectContext';
import { EmptyState } from '../../components/ui';
import MilestoneCard from '../../components/MilestoneCard/MilestoneCard';
import MilestoneFormModal from '../../components/forms/MilestoneFormModal';
import TaskFormModal from '../../components/forms/TaskFormModal';

export default function MilestonesTab() {
  const { project, canManage, reload } = useProjectContext();
  const [creating, setCreating] = useState(false);
  const [taskDraft, setTaskDraft] = useState(null); // { task?, milestoneId? }
  const membersById = useMemo(() => Object.fromEntries(project.members.map((m) => [m.id, m])), [project.members]);
  const milestones = [...project.milestones].sort((a, b) => a.startDate.localeCompare(b.startDate));
  const refresh = () => reload({ silent: true });

  return (
    <div className="tab-panel">
      <div className="tab-panel__head">
        <div>
          <h2 className="section__title">Milestones</h2>
          <p className="muted">Major stages of the project, each with its own tasks and progress.</p>
        </div>
        {canManage && <button type="button" className="btn btn--primary" onClick={() => setCreating(true)}><Plus size={17} /> New milestone</button>}
      </div>

      {milestones.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={Flag}
            title="No milestones yet"
            message={canManage ? 'Break the project into stages such as research, design and testing.' : 'The team has not added any milestones yet.'}
            action={canManage && <button type="button" className="btn btn--primary" onClick={() => setCreating(true)}><Plus size={17} /> Create the first milestone</button>}
          />
        </div>
      ) : (
        <div className="stack">
          {milestones.map((m) => (
            <MilestoneCard
              key={m.id}
              milestone={m}
              tasks={project.tasks}
              membersById={membersById}
              canEdit={canManage}
              onAddTask={(milestoneId) => setTaskDraft({ milestoneId })}
              onOpenTask={(task) => setTaskDraft({ task })}
            />
          ))}
        </div>
      )}

      {creating && <MilestoneFormModal project={project} onClose={() => setCreating(false)} onSaved={() => { setCreating(false); refresh(); }} />}
      {taskDraft && (
        <TaskFormModal
          project={project}
          task={taskDraft.task}
          presetMilestoneId={taskDraft.milestoneId}
          readOnly={!canManage}
          onClose={() => setTaskDraft(null)}
          onSaved={() => { setTaskDraft(null); refresh(); }}
        />
      )}
    </div>
  );
}
