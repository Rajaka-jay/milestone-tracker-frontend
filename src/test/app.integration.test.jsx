import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';
import { AuthProvider } from '../context/AuthContext';
import { ToastProvider } from '../context/ToastContext';
import { resetDb } from '../services/mock/db';
import { tokenStore } from '../services/http';
import { toISODate } from '../utils/dates';

const inDays = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return toISODate(d); };

function renderApp(path = '/login') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <ToastProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ToastProvider>
    </MemoryRouter>,
  );
}

async function signIn(user, email) {
  await user.type(screen.getByLabelText('Email'), email);
  await user.type(screen.getByLabelText('Password'), 'password123');
  await user.click(screen.getByRole('button', { name: 'Login' }));
}

beforeEach(() => {
  tokenStore.clear();
  resetDb();
});

describe('authentication', () => {
  it('shows validation messages instead of submitting an empty form', async () => {
    const user = userEvent.setup();
    renderApp();
    await user.click(screen.getByRole('button', { name: 'Login' }));
    expect(await screen.findByText('Enter your email address.')).toBeInTheDocument();
    expect(screen.getByText('Enter your password.')).toBeInTheDocument();
  });

  it('shows an error for wrong credentials', async () => {
    const user = userEvent.setup();
    renderApp();
    await user.type(screen.getByLabelText('Email'), 'amina@student.edu');
    await user.type(screen.getByLabelText('Password'), 'wrong-password');
    await user.click(screen.getByRole('button', { name: 'Login' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Email or password is incorrect.');
  });
});

describe('student journey', () => {
  it('logs in, opens a project and reaches every workspace tab', async () => {
    const user = userEvent.setup();
    renderApp();
    await signIn(user, 'amina@student.edu');

    expect(await screen.findByRole('heading', { name: /welcome back, amina/i })).toBeInTheDocument();
    expect(screen.getAllByText('Upcoming deadlines').length).toBeGreaterThan(0);

    await user.click(screen.getByRole('link', { name: 'My Projects' }));
    await user.click(await screen.findByRole('link', { name: /Smart Campus Energy Monitor/ }));
    expect(await screen.findByRole('heading', { name: 'Smart Campus Energy Monitor' })).toBeInTheDocument();
    expect(screen.getByText('Milestone timeline')).toBeInTheDocument();

    const tabs = within(screen.getByRole('navigation', { name: 'Project sections' }));
    await user.click(tabs.getByRole('link', { name: /Milestones/ }));
    expect(await screen.findByText('System design')).toBeInTheDocument();

    await user.click(tabs.getByRole('link', { name: /Tasks/ }));
    expect(await screen.findByRole('region', { name: 'To Do tasks' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'List' }));
    expect(await screen.findByRole('columnheader', { name: 'Assignee' })).toBeInTheDocument();

    await user.click(tabs.getByRole('link', { name: /Team/ }));
    expect(await screen.findByText('Priya Nair')).toBeInTheDocument();

    await user.click(tabs.getByRole('link', { name: /Documents/ }));
    expect(await screen.findByText('Requirements Specification.pdf')).toBeInTheDocument();
  });

  it('creates a milestone from the modal form', async () => {
    const user = userEvent.setup();
    renderApp();
    await signIn(user, 'amina@student.edu');
    await user.click(await screen.findByRole('link', { name: 'My Projects' }));
    await user.click(await screen.findByRole('link', { name: /Smart Campus Energy Monitor/ }));
    await user.click(within(await screen.findByRole('navigation', { name: 'Project sections' })).getByRole('link', { name: /Milestones/ }));
    await user.click(await screen.findByRole('button', { name: /New milestone/ }));

    const dialog = screen.getByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: 'Create milestone' }));
    expect(await within(dialog).findByText('Enter a milestone name.')).toBeInTheDocument();

    await user.type(within(dialog).getByLabelText(/Milestone name/), 'Final presentation');
    await user.type(within(dialog).getByLabelText(/Deadline/), inDays(30));
    await user.click(within(dialog).getByRole('button', { name: 'Create milestone' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(await screen.findByText('Final presentation')).toBeInTheDocument();
  });
});

describe('supervisor journey', () => {
  it('shows assigned projects and lets the supervisor post feedback but not edit tasks', async () => {
    const user = userEvent.setup();
    renderApp();
    await signIn(user, 'supervisor@uni.edu');

    expect(await screen.findByText('Assigned projects')).toBeInTheDocument();
    await user.click((await screen.findAllByRole('link', { name: /Open/ }))[0]);
    expect(await screen.findByText('Supervisor feedback')).toBeInTheDocument();

    await user.type(screen.getByLabelText('Add feedback for the team'), 'Please add a risk register.');
    await user.click(screen.getByRole('button', { name: 'Post feedback' }));
    expect(await screen.findByText('Please add a risk register.')).toBeInTheDocument();

    await user.click(within(screen.getByRole('navigation', { name: 'Project sections' })).getByRole('link', { name: /Tasks/ }));
    await screen.findByRole('region', { name: 'To Do tasks' });
    expect(screen.queryByRole('button', { name: /New task/ })).not.toBeInTheDocument();
  });

  it('cannot open the student dashboard', async () => {
    const user = userEvent.setup();
    renderApp();
    await signIn(user, 'supervisor@uni.edu');
    await screen.findByText('Assigned projects');
    expect(screen.queryByRole('link', { name: 'My Projects' })).not.toBeInTheDocument();
  });
});

describe('projects and invitations', () => {
  it('creates a project and invites a student who then sees the invitation', async () => {
    const user = userEvent.setup();
    renderApp();
    await signIn(user, 'amina@student.edu');
    await user.click(await screen.findByRole('button', { name: /New project/ }));

    const dialog = screen.getByRole('dialog');
    await user.type(within(dialog).getByLabelText(/Project title/), 'Robotics Club Portal');
    await user.type(within(dialog).getByLabelText(/Description/), 'Membership and event management.');
    await user.selectOptions(within(dialog).getByLabelText(/Supervisor/), 's1');
    await user.type(within(dialog).getByLabelText(/End date/), inDays(60));
    await user.type(within(dialog).getByLabelText(/Search students/), 'sofia');
    await user.click(await within(dialog).findByRole('button', { name: 'Invite' }));
    await user.click(within(dialog).getByRole('button', { name: 'Create project' }));

    expect(await screen.findByRole('heading', { name: 'Robotics Club Portal' })).toBeInTheDocument();
  });

  it('lets a student accept an invitation from the notification bell', async () => {
    const user = userEvent.setup();
    renderApp();
    await signIn(user, 'amina@student.edu');
    await user.click(await screen.findByRole('button', { name: /Notifications, 2 unread/ }));
    await user.click(await screen.findByRole('button', { name: 'Accept' }));
    expect(await screen.findByRole('heading', { name: 'Campus Navigation App' })).toBeInTheDocument();
  });
});
