import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { countByStatus, milestoneProgress, projectProgress } from '../../utils/progress';
import { TASK_STATUSES } from '../../utils/constants';
import { EmptyState } from '../ui';

const BLUE = '#1F5FD8';
const STATUS_COLORS = { todo: '#B8C1CC', in_progress: '#1F5FD8', done: '#2F9E63' };
const TICK = { fontSize: 12, fill: '#52606D' };

export function ChartCard({ title, subtitle, children }) {
  return (
    <section className="card chart-card">
      <header className="card__header">
        <h2 className="card__title">{title}</h2>
        {subtitle && <p className="card__subtitle">{subtitle}</p>}
      </header>
      {children}
    </section>
  );
}

const shorten = (text, n = 22) => (text.length > n ? `${text.slice(0, n - 1)}…` : text);

function HorizontalBars({ data }) {
  return (
    <div className="chart" role="img" aria-label={data.map((d) => `${d.full}: ${d.value}%`).join('; ')}>
      <ResponsiveContainer width="100%" height={Math.max(160, data.length * 44 + 20)}>
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, bottom: 0, left: 0 }}>
          <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={TICK} axisLine={false} tickLine={false} />
          <YAxis type="category" dataKey="name" width={130} tick={TICK} axisLine={false} tickLine={false} />
          <Tooltip cursor={{ fill: '#F1F4F8' }} formatter={(v) => [`${v}%`, 'Complete']} labelFormatter={(_, p) => p?.[0]?.payload?.full} />
          <Bar dataKey="value" fill={BLUE} radius={[0, 4, 4, 0]} barSize={16} background={{ fill: '#EDF0F4', radius: 4 }} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ProjectCompletionChart({ projects }) {
  const data = projects.map((p) => ({ name: shorten(p.title), full: p.title, value: projectProgress(p) }));
  return (
    <ChartCard title="Project completion" subtitle="Share of tasks finished in each project">
      {data.length ? <HorizontalBars data={data} /> : <EmptyState compact title="No projects to chart" message="Create a project to see its completion here." />}
    </ChartCard>
  );
}

export function MilestoneProgressChart({ projects }) {
  const rows = projects
    .flatMap((p) => p.milestones.map((m) => ({ m, p })))
    .filter(({ m, p }) => milestoneProgress(m, p.tasks) < 100)
    .sort((a, b) => a.m.deadline.localeCompare(b.m.deadline))
    .slice(0, 6)
    .map(({ m, p }) => ({ name: shorten(m.name), full: `${m.name} (${p.title})`, value: milestoneProgress(m, p.tasks) }));
  return (
    <ChartCard title="Milestone progress" subtitle="Next milestones to finish, earliest deadline first">
      {rows.length ? <HorizontalBars data={rows} /> : <EmptyState compact title="No open milestones" message="Milestones you add to a project appear here." />}
    </ChartCard>
  );
}

export function TaskStatusChart({ tasks }) {
  const counts = countByStatus(tasks);
  const data = TASK_STATUSES.map((s) => ({ ...s, count: counts[s.value] }));
  const total = tasks.length;
  return (
    <ChartCard title="Task status" subtitle="All tasks across the selected projects">
      {total === 0 ? (
        <EmptyState compact title="No tasks yet" message="Add tasks to a milestone to track their status." />
      ) : (
        <div className="donut">
          <div className="donut__chart" role="img" aria-label={data.map((d) => `${d.label}: ${d.count}`).join(', ')}>
            <ResponsiveContainer width="100%" height={170}>
              <PieChart>
                <Pie data={data.filter((d) => d.count > 0)} dataKey="count" nameKey="label" innerRadius={52} outerRadius={78} paddingAngle={2} stroke="none">
                  {data.filter((d) => d.count > 0).map((d) => <Cell key={d.value} fill={STATUS_COLORS[d.value]} />)}
                </Pie>
                <Tooltip formatter={(v, n) => [v, n]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="donut__center"><strong>{total}</strong><span>tasks</span></div>
          </div>
          <ul className="legend">
            {data.map((d) => (
              <li key={d.value}>
                <span className="legend__swatch" style={{ background: STATUS_COLORS[d.value] }} />
                <span>{d.label}</span>
                <strong>{d.count}</strong>
              </li>
            ))}
          </ul>
        </div>
      )}
    </ChartCard>
  );
}
