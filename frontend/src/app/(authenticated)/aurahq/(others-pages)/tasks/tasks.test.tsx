import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import TasksPage from './page';
import { SWRConfig } from 'swr';

const mockSession = {
  data: {
    user: {
      id: 'usr_admin',
      name: 'Admin User',
      email: 'admin@auraworks.co.za',
      role: 'admin',
    },
  },
  isPending: false,
};

jest.mock('@/lib/auth-client', () => ({
  useSession: () => mockSession,
}));

describe('Tasks Board Integration Tests', () => {
  let mockFetch: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSession.data.user = {
      id: 'usr_admin',
      name: 'Admin User',
      email: 'admin@auraworks.co.za',
      role: 'admin',
    };

    mockFetch = jest.fn().mockImplementation((url: string, options?: any) => {
      if (url.includes('/api/v1/tasks') && options?.method === 'POST') {
        const body = JSON.parse(options.body);
        return Promise.resolve({
          ok: true,
          json: async () => ({
            status: 'success',
            task: {
              id: 'task_new',
              title: body.title,
              description: body.description,
              status: body.status || 'todo',
              priority: body.priority || 'medium',
              due_date: body.due_date,
              created_by_id: 'usr_admin',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          }),
        });
      }

      if (url.includes('/api/v1/tasks/task_1') && options?.method === 'PATCH') {
        const body = JSON.parse(options.body);
        return Promise.resolve({
          ok: true,
          json: async () => ({
            status: 'success',
            task: {
              id: 'task_1',
              title: body.title || 'Follow up with Anglo Platinum',
              status: body.status || 'todo',
              priority: body.priority || 'high',
              created_by_id: 'usr_admin',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          }),
        });
      }

      if (url.includes('/api/v1/tasks/task_1') && options?.method === 'DELETE') {
        return Promise.resolve({
          ok: true,
          json: async () => ({ status: 'success' }),
        });
      }

      if (url.includes('/api/v1/tasks')) {
        return Promise.resolve({
          ok: true,
          json: async () => [
            {
              id: 'task_1',
              title: 'Follow up with Anglo Platinum',
              description: 'Send contract renewal terms',
              status: 'todo',
              priority: 'high',
              due_date: '2026-10-25T00:00:00Z',
              created_by_id: 'usr_admin',
              created_at: '2026-10-10T10:00:00Z',
              updated_at: '2026-10-10T10:00:00Z',
            },
            {
              id: 'task_2',
              title: 'Prepare VSL Funnel Metrics',
              description: 'Compile Q3 conversion signals',
              status: 'in_progress',
              priority: 'urgent',
              due_date: '2026-10-18T00:00:00Z',
              created_by_id: 'usr_rep',
              created_at: '2026-10-09T10:00:00Z',
              updated_at: '2026-10-09T10:00:00Z',
            },
          ],
        });
      }

      return Promise.resolve({
        ok: true,
        json: async () => ({}),
      });
    });

    global.fetch = mockFetch;
  });

  const renderWithSWR = () => {
    return render(
      <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>
        <TasksPage />
      </SWRConfig>
    );
  };

  test('renders Tasks Board with 3 Kanban columns and fetches tasks', async () => {
    renderWithSWR();

    expect(screen.getAllByText('Tasks Board').length).toBeGreaterThan(0);
    expect(screen.getByText('To Do')).toBeInTheDocument();
    expect(screen.getByText('In Progress')).toBeInTheDocument();
    expect(screen.getByText('Done')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Follow up with Anglo Platinum')).toBeInTheDocument();
      expect(screen.getByText('Prepare VSL Funnel Metrics')).toBeInTheDocument();
    });
  });

  test('opens Create Task modal and dispatches POST /api/v1/tasks', async () => {
    renderWithSWR();

    const addTaskBtns = screen.getAllByRole('button', { name: /Add Task/i });
    fireEvent.click(addTaskBtns[0]);

    expect(screen.getByText('Create New Task')).toBeInTheDocument();

    const titleInput = screen.getByPlaceholderText(/e\.g\. Schedule Product Demo with Client/i);
    fireEvent.change(titleInput, { target: { value: 'New Enterprise Lead Review' } });

    const submitBtn = screen.getByRole('button', { name: /Create Task/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/tasks'),
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('"title":"New Enterprise Lead Review"'),
        })
      );
    });
  });

  test('transitions task status to next column via quick shift action', async () => {
    renderWithSWR();

    await waitFor(() => {
      expect(screen.getByText('Follow up with Anglo Platinum')).toBeInTheDocument();
    });

    // In 'todo' column, click the forward button to move to 'in_progress'
    const moveForwardBtn = screen.getByTitle('Move to In Progress');
    fireEvent.click(moveForwardBtn);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/tasks/task_1'),
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({ status: 'in_progress' }),
        })
      );
    });
  });

  test('edits an existing task via Edit modal', async () => {
    renderWithSWR();

    await waitFor(() => {
      expect(screen.getByText('Follow up with Anglo Platinum')).toBeInTheDocument();
    });

    const editBtns = screen.getAllByTitle('Edit task');
    fireEvent.click(editBtns[0]);

    expect(screen.getByText('Edit Task')).toBeInTheDocument();

    const titleInput = screen.getByDisplayValue('Follow up with Anglo Platinum');
    fireEvent.change(titleInput, { target: { value: 'Updated Anglo Task' } });

    const updateBtn = screen.getByRole('button', { name: /Update Task/i });
    fireEvent.click(updateBtn);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/tasks/task_1'),
        expect.objectContaining({
          method: 'PATCH',
          body: expect.stringContaining('"title":"Updated Anglo Task"'),
        })
      );
    });
  });

  test('deletes a task and dispatches DELETE /api/v1/tasks/{id}', async () => {
    renderWithSWR();

    await waitFor(() => {
      expect(screen.getByText('Follow up with Anglo Platinum')).toBeInTheDocument();
    });

    const deleteBtns = screen.getAllByTitle('Delete task');
    fireEvent.click(deleteBtns[0]);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/tasks/task_1'),
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });
  });

  test('filters tasks by search keyword', async () => {
    renderWithSWR();

    await waitFor(() => {
      expect(screen.getByText('Follow up with Anglo Platinum')).toBeInTheDocument();
      expect(screen.getByText('Prepare VSL Funnel Metrics')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/Search tasks\.\.\./i);
    fireEvent.change(searchInput, { target: { value: 'Anglo' } });

    expect(screen.getByText('Follow up with Anglo Platinum')).toBeInTheDocument();
    expect(screen.queryByText('Prepare VSL Funnel Metrics')).not.toBeInTheDocument();
  });
});
