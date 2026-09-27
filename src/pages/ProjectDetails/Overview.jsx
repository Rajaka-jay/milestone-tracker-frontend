import { Link } from 'react-router-dom';
import { useProjectContext } from '../../hooks/useProjectContext';
import { formatDate, daysUntil } from '../../utils/dates';
import { isTaskOverdue, milestoneStatus, projectProgress, projectStatus } from '../../utils/progress';
import { Avatar, ProjectStatusBadge } from '../../components/ui';
import ProgressBar from '../../components/ProgressBar/ProgressBar';
import MilestoneTimeline from './MilestoneTimeline';
import FeedbackPanel from './FeedbackPanel';
import ActivityList from './ActivityList';

function remaining(project) {
  const n = daysUntil(project.endDate);
  if (n > 1) return `${n} days left`;
  if (n === 1) return '1 day left';
  if (n === 0) return 'Ends today';
  return `Ended ${-n} days ago`;
}

export default function OverviewTab() {
  const { project, isSupervisor, reload } = useProjectContext();
  const done = project.tasks.filter((t) => t.status === 'done').length;
  const milestonesDone = project.milestones.filter((m) => milestoneStatus(m, project.tasks) === 'completed').length;
  const overdue = project.tasks.filter((t) => isTaskOverdue(t)).length;

  return (
    <div className="overview">
      <div className="overview__main">
        <section className="card">
          <header className="card__header">
            <h2 className="card__title">Milestone timeline</h2>
            <p className="card__subtitle">Each bar spans a milestone's start date to its deadline.</p>
          </header>
          <MilestoneTimeline project={project} />
        </section>

        <section className="card">
          <header className="card__header"><h2 className="card__title">Project information</h2></header>
          <p className="prose">{project.description}</p>
          <dl className="facts">
            <div><dt>Supervisor</dt><dd>{project.supervisor?.fullName}</dd></div>
            <div><dt>Project leader</dt><dd>{project.members.find((m) => m.id === project.leaderId)?.fullName}</dd></div>
            <div><dt>Start date</dt><dd>{formatDate(project.startDate)}</dd></div>
            <div><dt>End date</dt><dd>{formatDate(project.endDate)}</dd></div>
            <div><dt>Status</dt><dd><ProjectStatusBadge status={projectStatus(project)} /></dd></div>
            <div><dt>Time remaining</dt><dd>{remaining(project)}</dd></div>
          </dl>
        </section>

        <FeedbackPanel project={project} canPost={isSupervisor} onPosted={() => reload({ silent: true })} />
      </div>

      <div className="overview__side">
        <section className="card">
          <header className="card__header"><h2 className="card__title">Progress</h2></header>
          <div className="big-progress">
            <span className="big-progress__value">{projectProgress(project)}%</span>
            <span className="big-progress__label">of tasks complete</span>
          </div>
          <ProgressBar value={projectProgress(project)} showValue={false} label="Overall project progress" />
          <dl className="tally">
            <div><dt>Tasks done</dt><dd>{done} of {project.tasks.length}</dd></div>
            <div><dt>Milestones done</dt><dd>{milestonesDone} of {project.milestones.length}</dd></div>
            <div><dt>Overdue tasks</dt><dd className={overdue ? 'is-overdue' : ''}>{overdue}</dd></div>
          </dl>
        </section>

        <section className="card">
          <header className="card__header card__header--row">
            <h2 className="card__title">Team</h2>
            <Link to="team" className="link">View team</Link>
          </header>
          <ul className="people">
            {project.members.map((m) => (
              <li key={m.id}>
                <Avatar name={m.fullName} size="sm" />
                <span>{m.fullName}</span>
                {m.projectRole === 'leader' && <span className="people__role">Leader</span>}
              </li>
            ))}
          </ul>
        </section>

        <section className="card">
          <header className="card__header"><h2 className="card__title">Project history</h2></header>
          <ActivityList items={project.history.slice(0, 8)} />
        </section>
      </div>
    </div>
  );
}
