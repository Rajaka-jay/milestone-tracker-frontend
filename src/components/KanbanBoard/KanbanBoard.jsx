import { useState } from 'react';
import { TASK_STATUSES } from '../../utils/constants';
import { byDeadline } from '../../utils/progress';
import TaskCard from '../TaskCard/TaskCard';

export default function KanbanBoard({ tasks, milestonesById, membersById, canEdit, onOpen, onMove }) {
  const [overColumn, setOverColumn] = useState(null);

  return (
    <div className="board">
      {TASK_STATUSES.map((col) => {
        const items = tasks.filter((t) => t.status === col.value).sort(byDeadline);
        return (
          <section
            key={col.value}
            className={`board__col board__col--${col.value} ${overColumn === col.value ? 'is-over' : ''}`}
            aria-label={`${col.label} tasks`}
            onDragOver={(e) => { if (canEdit) { e.preventDefault(); setOverColumn(col.value); } }}
            onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setOverColumn(null); }}
            onDrop={(e) => {
              e.preventDefault();
              setOverColumn(null);
              const id = e.dataTransfer.getData('text/plain');
              if (canEdit && id) onMove(id, col.value);
            }}
          >
            <header className="board__head">
              <h3>{col.label}</h3>
              <span className="count-pill">{items.length}</span>
            </header>
            <div className="board__list">
              {items.map((t) => (
                <TaskCard
                  key={t.id}
                  task={t}
                  milestone={milestonesById[t.milestoneId]}
                  assignee={membersById[t.assigneeId]}
                  canEdit={canEdit}
                  onOpen={onOpen}
                  onStatusChange={onMove}
                />
              ))}
              {items.length === 0 && <p className="board__empty">{canEdit ? 'Drop a task here' : 'No tasks'}</p>}
            </div>
          </section>
        );
      })}
    </div>
  );
}
