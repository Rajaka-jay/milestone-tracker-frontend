import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FolderKanban, CalendarClock, AlertTriangle, UserCheck, TrendingUp, Plus, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useFetch } from '../../hooks/useFetch';
import { projectsApi } from '../../services/api';
import { PROJECT_FILTERS } from '../../utils/constants';
import { byDeadline, milestoneProgress, milestoneStatus, projectStatus, taskProgress } from '../../utils/progress';
import { daysUntil, deadlineLabel, todayISO } from '../../utils/dates';
import { PageLoader, ErrorState, EmptyState, PageHeader, SegmentedControl, StatCard } from '../../components/ui';
import ProjectCard from '../../components/ProjectCard/ProjectCard';
import ProgressBar from '../../components/ProgressBar/ProgressBar';
import ProjectFormModal from '../../components/forms/ProjectFormModal';
import { MilestoneProgressChart, ProjectCompletionChart, TaskStatusChart } from '../../components/Charts/Charts';

function ListPanel({ title, count, items, empty, render }) {
  return (
    <section className="card">
      <header className="card__header card__header--row">
        <h2 className="card__title">{title}</h2>
        <span className="count-pill">{count}</span>
      </header>
      {items.length === 0 ? <p className="card__empty">{empty}</p> : <ul className="rows">{items.map(render)}</ul>}
    </section>
  );
}

function TaskRow(t) {
  const late = t.deadline < todayISO();
  return (
    <li key={t.id}>
      <Link to={`/projects/${t.projectId}/tasks`} className="row-link">
        <span className="row-link__main">
          <span className="row-link__title">{t.title}</span>
          <span className="row-link__sub">{t.projectTitle}</span>
        </span>
        <span className={`row-link__meta ${late ? 'is-overdue' : ''}`}>{deadlineLabel(t.deadline)}</span>
      </Link>
    </li>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data, loading, error, reload } = useFetch(() => projectsApi.list(), []);
  const [filter, setFilter] = useState('all');
  const [creating, setCreating] = useState(false);

  const view = useMemo(() => {
    const projects = data ?? [];
    const today = todayISO();
    const filtered = projects.filter((p) => filter === 'all' || projectStatus(p) === filter);
    const tasks = filtered.flatMap((p) => p.tasks.map((t) => ({ ...t, projectId: p.id, projectTitle: p.title })));
    const open = tasks.filter((t) => t.status !== 'done');
    const milestones = filtered.flatMap((p) => p.milestones.map((m) => ({
      ...m, projectId: p.id, projectTitle: p.title, progress: milestoneProgress(m, p.tasks), status: milestoneStatus(m, p.tasks),
    })));
    return {
      filtered,
      tasks,
      counts: Object.fromEntries(PROJECT_FILTERS.map((f) => [f.value, f.value === 'all' ? projects.length : projects.filter((p) => projectStatus(p) === f.value).length])),
      active: filtered.filter((p) => projectStatus(p) === 'active').length,
      overdue: open.filter((t) => t.deadline < today).sort(byDeadline),
      upcoming: open.filter((t) => t.deadline >= today && daysUntil(t.deadline) <= 14).sort(byDeadline),
      mine: open.filter((t) => t.assigneeId === user.id).sort(byDeadline),
      milestones: milestones.filter((m) => m.status !== 'completed').sort((a, b) => a.deadline.localeCompare(b.deadline)).slice(0, 5),
      overall: taskProgress(tasks),
    };
  }, [data, filter, user.id]);

  if (loading && !data) return <PageLoader />;
  if (error && !data) return <ErrorState error={error} onRetry={reload} />;

  const firstName = user.fullName.split(' ')[0];

  return (
    <div className="page">
      <PageHeader
        title={`Welcome back, ${firstName}`}
        subtitle="Here is where your projects stand today."
        actions={<button type="button" className="btn btn--primary" onClick={() => setCreating(true)}><Plus size={17} /> New project</button>}
      />

      <div className="toolbar">
        <SegmentedControl
          label="Filter projects"
          value={filter}
          onChange={setFilter}
          options={PROJECT_FILTERS.map((f) => ({ ...f, count: view.counts[f.value] }))}
        />
      </div>

      {(data ?? []).length === 0 ? (
        <div className="card">
          <EmptyState
            icon={FolderKanban}
            title="You don't have any projects yet"
            message="Create a project to plan milestones and tasks with your team, or accept an invitation from the notification bell."
            action={<button type="button" className="btn btn--primary" onClick={() => setCreating(true)}><Plus size={17} /> Create your first project</button>}
          />
        </div>
      ) : (
        <>
          <div className="stats">
            <StatCard icon={FolderKanban} label="Active projects" value={view.active} />
            <StatCard icon={CalendarClock} label="Upcoming deadlines" value={view.upcoming.length} hint="Next 14 days" tone="amber" />
            <StatCard icon={AlertTriangle} label="Overdue tasks" value={view.overdue.length} tone="red" />
            <StatCard icon={UserCheck} label="Assigned to me" value={view.mine.length} hint="Not yet done" />
            <div className="stat stat--wide">
              <span className="stat__icon stat__icon--green"><TrendingUp size={18} /></span>
              <div className="stat__grow">
                <div className="stat__label">Overall progress</div>
                <ProgressBar value={view.overall} label="Overall progress" />
              </div>
            </div>
          </div>

          <div className="grid grid--3">
            <ProjectCompletionChart projects={view.filtered} />
            <TaskStatusChart tasks={view.tasks} />
            <MilestoneProgressChart projects={view.filtered} />
          </div>

          <div className="grid grid--2">
            <ListPanel title="Upcoming deadlines" count={view.upcoming.length} items={view.upcoming.slice(0, 5)} empty="Nothing due in the next two weeks." render={TaskRow} />
            <ListPanel title="Overdue tasks" count={view.overdue.length} items={view.overdue.slice(0, 5)} empty="No overdue tasks. Nice work." render={TaskRow} />
            <ListPanel title="Assigned to me" count={view.mine.length} items={view.mine.slice(0, 5)} empty="You have no open tasks assigned to you." render={TaskRow} />
            <ListPanel
              title="Upcoming milestones"
              count={view.milestones.length}
              items={view.milestones}
              empty="No open milestones."
              render={(m) => (
                <li key={m.id}>
                  <Link to={`/projects/${m.projectId}/milestones`} className="row-link row-link--stack">
                    <span className="row-link__main">
                      <span className="row-link__title">{m.name}</span>
                      <span className="row-link__sub">{m.projectTitle}</span>
                    </span>
                    <span className="row-link__meta">{deadlineLabel(m.deadline)}</span>
                    <span className="row-link__bar"><ProgressBar value={m.progress} size="sm" label={`${m.name} progress`} /></span>
                  </Link>
                </li>
              )}
            />
          </div>

          <section className="section">
            <header className="section__header">
              <h2 className="section__title">Projects</h2>
              <Link to="/projects" className="link link--arrow">View all projects <ArrowRight size={15} /></Link>
            </header>
            {view.filtered.length === 0 ? (
              <div className="card"><EmptyState compact title="No projects match this filter" message="Choose a different filter to see your other projects." /></div>
            ) : (
              <div className="grid grid--cards">{view.filtered.slice(0, 3).map((p) => <ProjectCard key={p.id} project={p} />)}</div>
            )}
          </section>
        </>
      )}

      {creating && <ProjectFormModal onClose={() => setCreating(false)} onCreated={(p) => navigate(`/projects/${p.id}`)} />}
    </div>
  );
}
