import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CalendarPage from './page';
import { SWRConfig } from 'swr';

jest.mock('@fullcalendar/daygrid', () => ({}), { virtual: true });
jest.mock('@fullcalendar/interaction', () => ({}), { virtual: true });
jest.mock('@fullcalendar/multimonth', () => ({}), { virtual: true });
jest.mock('@fullcalendar/timegrid', () => ({}), { virtual: true });

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

jest.mock('@/context/ThemeContext', () => ({
  useTheme: () => ({ theme: 'light', toggleTheme: jest.fn() }),
}));

jest.mock('next-intl', () => ({
  useLocale: () => 'en',
}));

// Mock FullCalendar to make event testing fast and deterministic in JSDOM
jest.mock('@fullcalendar/react', () => {
  const MockFullCalendar = (props: any) => {
    return (
      <div data-testid="fullcalendar-mock">
        <div data-testid="calendar-events">
          {(props.events || []).map((evt: any) => (
            <div
              key={evt.id}
              data-testid={`event-${evt.id}`}
              onClick={() =>
                props.eventClick?.({
                  event: {
                    id: evt.id,
                    title: evt.title,
                    startStr: evt.start,
                    endStr: evt.end || evt.start,
                    extendedProps: evt.extendedProps,
                  },
                })
              }
            >
              {evt.title}
            </div>
          ))}
        </div>
        <button
          type="button"
          data-testid="mock-date-select"
          onClick={() =>
            props.select?.({
              startStr: '2026-10-15',
              endStr: '2026-10-15',
            })
          }
        >
          Select Date
        </button>
      </div>
    );
  };
  return {
    __esModule: true,
    default: MockFullCalendar,
  };
});

describe('Calendar Module Integration Tests', () => {
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
      if (url.includes('/api/v1/calendar/events') && options?.method === 'POST') {
        const body = JSON.parse(options.body);
        return Promise.resolve({
          ok: true,
          json: async () => ({
            status: 'success',
            event: {
              id: 'evt_new',
              title: body.title,
              start: body.start_time,
              end: body.end_time,
              allDay: false,
              extendedProps: {
                category: body.category,
                user_id: 'usr_admin',
              },
            },
          }),
        });
      }

      if (url.includes('/api/v1/calendar/events/evt_1') && options?.method === 'PUT') {
        const body = JSON.parse(options.body);
        return Promise.resolve({
          ok: true,
          json: async () => ({
            status: 'success',
            event: {
              id: 'evt_1',
              title: body.title,
              start: body.start_time,
              end: body.end_time,
              allDay: false,
              extendedProps: {
                category: body.category,
                user_id: 'usr_rep',
              },
            },
          }),
        });
      }

      if (url.includes('/api/v1/calendar/events/evt_1') && options?.method === 'DELETE') {
        return Promise.resolve({
          ok: true,
          json: async () => ({ status: 'success' }),
        });
      }

      if (url.includes('/api/v1/calendar/events')) {
        return Promise.resolve({
          ok: true,
          json: async () => [
            {
              id: 'evt_1',
              title: 'Quarterly Sales Alignment',
              start: '2026-10-20T09:00:00Z',
              end: '2026-10-20T10:00:00Z',
              allDay: false,
              extendedProps: {
                category: 'primary',
                user_id: 'usr_rep',
              },
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
        <CalendarPage />
      </SWRConfig>
    );
  };

  test('renders Calendar page and loads events from /api/v1/calendar/events', async () => {
    renderWithSWR();

    expect(screen.getAllByText('Calendar').length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: /Add Event/i })).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Quarterly Sales Alignment')).toBeInTheDocument();
    });
  });

  test('allows creating a new event and calls POST /api/v1/calendar/events', async () => {
    renderWithSWR();

    const addBtn = screen.getByRole('button', { name: /Add Event/i });
    fireEvent.click(addBtn);

    expect(screen.getByRole('heading', { name: /Add Event/i })).toBeInTheDocument();

    const titleInput = screen.getByLabelText(/Event Title/i);
    fireEvent.change(titleInput, { target: { value: 'New Executive Review' } });

    // Submit button inside modal has "Add Event" text
    const submitBtns = screen.getAllByRole('button', { name: /Add Event/i });
    const modalSubmitBtn = submitBtns[submitBtns.length - 1];
    fireEvent.click(modalSubmitBtn);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/calendar/events'),
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('"title":"New Executive Review"'),
        })
      );
    });
  });

  test('admin can edit and delete any event', async () => {
    renderWithSWR();

    await waitFor(() => {
      expect(screen.getByTestId('event-evt_1')).toBeInTheDocument();
    });

    // Click event to open edit modal
    fireEvent.click(screen.getByTestId('event-evt_1'));

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Edit Event/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Delete Event/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Update Changes/i })).toBeInTheDocument();
    });

    // Test Delete
    const deleteBtn = screen.getByRole('button', { name: /Delete Event/i });
    fireEvent.click(deleteBtn);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/calendar/events/evt_1'),
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });
  });

  test('sales rep cannot edit or delete another user event (RBAC check)', async () => {
    // Set user as sales rep who is NOT the creator of evt_1
    mockSession.data.user = {
      id: 'usr_different_rep',
      name: 'Other Rep',
      email: 'other@auraworks.co.za',
      role: 'sales',
    };

    renderWithSWR();

    await waitFor(() => {
      expect(screen.getByTestId('event-evt_1')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('event-evt_1'));

    await waitFor(() => {
      expect(screen.getByText(/You have view-only access/i)).toBeInTheDocument();
      // Delete and Update buttons should not be rendered for non-owner rep
      expect(screen.queryByRole('button', { name: /Delete Event/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Update Changes/i })).not.toBeInTheDocument();
    });
  });
});
