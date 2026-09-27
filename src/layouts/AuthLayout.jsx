import { Outlet } from 'react-router-dom';
import { GraduationCap, Flag, Users, MessageSquare } from 'lucide-react';

const POINTS = [
  { icon: Flag, text: 'Break each project into milestones with clear deadlines.' },
  { icon: Users, text: 'See who owns which task and how the team is progressing.' },
  { icon: MessageSquare, text: 'Receive supervisor feedback in the same place you plan.' },
];

export default function AuthLayout() {
  return (
    <div className="auth">
      <aside className="auth__panel">
        <div className="auth__brand">
          <span className="brand__mark brand__mark--light"><GraduationCap size={22} /></span>
          <strong>Milestone Tracker</strong>
        </div>
        <div>
          <h1 className="auth__headline">Keep your team project on schedule from proposal to final submission.</h1>
          <ul className="auth__points">
            {POINTS.map(({ icon: Icon, text }) => (
              <li key={text}><Icon size={18} /><span>{text}</span></li>
            ))}
          </ul>
        </div>
        <p className="auth__foot">Undergraduate project management system</p>
      </aside>
      <main className="auth__main">
        <Outlet />
      </main>
    </div>
  );
}
