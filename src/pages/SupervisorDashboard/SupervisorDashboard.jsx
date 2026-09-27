import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, FolderKanban, CheckCircle2, Activity, TrendingUp, MessageSquare, ExternalLink } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useFetch } from '../../hooks/useFetch';
import { projectsApi } from '../../services/api';
import { formatDate } from '../../utils/dates';
import { memberStats, projectProgress, projectStatus, taskProgress } from '../../utils/progress';
import { Avatar, EmptyState, ErrorState, PageHeader, PageLoader, ProjectStatusBadge, SegmentedControl, StatCard } from '../../components/ui';
import ProgressBar from '../../components/ProgressBar/ProgressBar';
import ActivityList from '../ProjectDetails/ActivityList';

function SupervisedProject({ project }) {
  const [open, setOpen] = useState(false);
  const status = projectStatus(project);
  return (
    <article className="supervised">
      <div className="supervised__row">
        <div className="supervised__title">
          <h3>{project.title}</h3>
          <ProjectStatusBadge status={status} />
        </div>
        <div className="supervised__progress"><ProgressBar value={projectProgress(project)} label={`${project.title} progress`} /></div>
        <div className="supervised__due">
          <span className="supervised__due-label">Deadline</span>
          <span className={status === 'overdue' ? 'is-overdue' : ''}>{formatDate(project.endDate)}</span>
        </div>
        <div className="supervised__actions">
          <Link to={`/projects/${project.id}`} className="btn btn--secondary btn--sm"><ExternalLink size={15} /> Open</Link>
          <Link to={`/projects/${project.id}`} className="btn btn--primary btn--sm"><MessageSquare size={15} /> Feedback</Link>
        </div>
      </div>
      <button type="button" className="link-btn supervised__toggle" aria-expanded={open} onClick={() => setOpen(!open)}>
        <ChevronDown size={16} className={open ? 'rot' : ''} />
        Team progress ({project.members.length} members)
      </button>
      {open && (
        <ul className="supervised__members">
          {project.members.map((m) => {
            const s = memberStats(m.id, project.tasks);
            return (
              <li key={m.id}>
                <span className="cell-person"><Avatar name={m.fullName} size="sm" /> {m.fullName}{m.projectRole === 'leader' && <span className="people__role">Leader</span>}</span>
                <span className="supervised__member-count">{s.done} of {s.total} tasks</span>
                <ProgressBar value={s.progress} size="sm" label={`${m.fullName} progress`} />
              </li>
            );
          })}
        </ul>
      )}
    </article>
  );
}

export default function SupervisorDashboardPage() {
  const { user } = useAuth();
  const projectsQ = useFetch(() => projectsApi.list(), []);
  const activityQ = useFetch(() => projectsApi.activity(), []);
  const [tab, setTab] = useState('active');

  const view = useMemo(() => {
    const projects = projectsQ.data ?? [];
    const completed = projects.filter((p) => projectStatus(p) === 'completed');
    const active = projects.filter((p) => projectStatus(p) !== 'completed');
    return {
      projects, completed, active,
      average: taskProgress(projects.flatMap((p) => p.tasks)),
      overdue: projects.filter((p) => projectStatus(p) === 'overdue').length,
    };
  }, [projectsQ.data]);

  if (projectsQ.loading && !projectsQ.data) return <PageLoader />;
  if (projectsQ.error && !projectsQ.data) return <ErrorState error={projectsQ.error} onRetry={projectsQ.reload} />;

  const shown = tab === 'active' ? view.active : view.completed;

  return (
    <div className="page">
      <PageHeader title={`Hello, ${user.fullName}`} subtitle="Monitor the projects assigned to you and give the teams feedback." />

      <div className="stats stats--4">
        <StatCard icon={FolderKanban} label="Assigned projects" value={view.projects.length} />
        <StatCard icon={Activity} label="In progress" value={view.active.length} hint={view.overdue ? `${view.overdue} past deadline` : undefined} tone="amber" />
        <StatCard icon={CheckCircle2} label="Completed" value={view.completed.length} tone="green" />
        <StatCard icon={TrendingUp} label="Average progress" value={`${view.average}%`} />
      </div>

      <div className="supervisor-grid">
        <section>
          <div className="toolbar">
            <SegmentedControl
              label="Project status"
              value={tab}
              onChange={setTab}
              options={[
                { value: 'active', label: 'Active projects', count: view.active.length },
                { value: 'completed', label: 'Completed projects', count: view.completed.length },
              ]}
            />
          </div>
          {shown.length === 0 ? (
            <div className="card">
              <EmptyState
                icon={FolderKanban}
                title={tab === 'active' ? 'No active projects' : 'No completed projects yet'}
                message={tab === 'active' ? 'Projects appear here when a student team selects you as their supervisor.' : 'A project moves here once every one of its tasks is done.'}
              />
            </div>
          ) : (
            <div className="stack">{shown.map((p) => <SupervisedProject key={p.id} project={p} />)}</div>
          )}
        </section>

        <aside>
          <section className="card">
            <header className="card__header"><h2 className="card__title">Recent project history</h2></header>
            {activityQ.loading && !activityQ.data ? <p className="card__empty">Loading…</p> : <ActivityList items={activityQ.data ?? []} showProject />}
          </section>
        </aside>
      </div>
    </div>
  );
}
