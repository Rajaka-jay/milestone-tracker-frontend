import { Route, Routes } from 'react-router-dom';
import ProtectedRoute, { HomeRedirect, PublicOnlyRoute } from './routes/ProtectedRoute';
import AuthLayout from './layouts/AuthLayout';
import AppLayout from './layouts/AppLayout';
import LoginPage from './pages/Login/Login';
import AuthCallback from './pages/Login/AuthCallback';
import RegisterPage from './pages/Register/Register';
import ForgotPasswordPage from './pages/ForgotPassword/ForgotPassword';
import DashboardPage from './pages/Dashboard/Dashboard';
import ProjectsPage from './pages/Projects/Projects';
import JoinProjectPage from './pages/Projects/JoinProject';
import ProjectDetailsPage from './pages/ProjectDetails/ProjectDetails';
import OverviewTab from './pages/ProjectDetails/Overview';
import MilestonesTab from './pages/Milestones/Milestones';
import TasksTab from './pages/Tasks/Tasks';
import TeamTab from './pages/Team/Team';
import DocumentsTab from './pages/Documents/Documents';
import SupervisorDashboardPage from './pages/SupervisorDashboard/SupervisorDashboard';
import ProfilePage from './pages/Profile/Profile';
import NotFoundPage from './pages/NotFound';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />

      <Route element={<AuthLayout />}>
        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        </Route>
        <Route path="/auth/callback" element={<AuthCallback />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route element={<ProtectedRoute roles={['student']} />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/join/:token" element={<JoinProjectPage />} />
          </Route>

          <Route element={<ProtectedRoute roles={['supervisor']} />}>
            <Route path="/supervisor" element={<SupervisorDashboardPage />} />
          </Route>

          <Route path="/projects/:projectId" element={<ProjectDetailsPage />}>
            <Route index element={<OverviewTab />} />
            <Route path="milestones" element={<MilestonesTab />} />
            <Route path="tasks" element={<TasksTab />} />
            <Route path="team" element={<TeamTab />} />
            <Route path="documents" element={<DocumentsTab />} />
          </Route>

          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
