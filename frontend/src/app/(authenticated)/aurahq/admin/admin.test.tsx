import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AdminDashboardPage from './page';

jest.mock('@/lib/auth-client', () => ({
  useSession: jest.fn(() => ({
    data: {
      user: {
        id: 'admin_123',
        name: 'Chief Admin',
        email: 'admin@auraworks.co.za',
        role: 'admin',
      },
    },
    isPending: false,
  })),
  signOut: jest.fn(),
}));

const mockPush = jest.fn();
const mockReplace = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
  }),
}));

describe('Admin Console V2 Component & Integration Tests', () => {
  let mockFetch: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch = jest.fn().mockImplementation((url: string, options?: any) => {
      if (url.includes('/api/v1/admin/users') && options?.method === 'POST') {
        const body = JSON.parse(options.body);
        return Promise.resolve({
          ok: true,
          json: async () => ({
            status: 'success',
            user: {
              id: 'rep_new',
              name: body.name,
              email: body.email,
              role: body.role,
              job_title: body.job_title,
              permissions: body.permissions,
              is_active: true,
              total_links_generated: 0,
              paid_conversions: 0,
            },
          }),
        });
      }

      if (url.includes('/api/v1/admin/users/') && options?.method === 'PATCH') {
        const body = JSON.parse(options.body);
        return Promise.resolve({
          ok: true,
          json: async () => ({
            status: 'success',
            user: {
              id: 'rep_1',
              ...body,
            },
          }),
        });
      }

      if (url.includes('/api/v1/admin/users/') && options?.method === 'DELETE') {
        return Promise.resolve({
          ok: true,
          json: async () => ({ status: 'success' }),
        });
      }

      if (url.includes('/api/v1/admin/users')) {
        return Promise.resolve({
          ok: true,
          json: async () => [
            {
              id: 'rep_1',
              name: 'Sarah Connor',
              email: 'sarah@auraworks.co.za',
              role: 'sales',
              job_title: 'Senior Account Executive',
              permissions: ['analytics', 'sales'],
              is_active: true,
              total_links_generated: 15,
              paid_conversions: 6,
              created_at: '2026-06-01T10:00:00Z',
            },
          ],
        });
      }

      if (url.includes('/api/v1/admin/overview-metrics')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            active_clients: 10,
            trial_clients: 4,
            total_clients: 14,
            total_links_generated: 45,
            total_conversions: 18,
            conversion_rate_percentage: 40.0,
            total_mrr_cents: 25000000,
            total_mrr_zar: 250000.0,
            active_sales_reps: 4,
          }),
        });
      }

      if (url.includes('/api/v1/scripts')) {
        return Promise.resolve({
          ok: true,
          json: async () => [
            {
              client_id: 'client-active-1',
              company_name: 'BHP Billiton Minerals',
              subscription_status: 'active',
              whitelisted_domains: ['bhp.com'],
              contact_email: 'procurement@bhp.com',
              snippet: '<script src="https://cdn.auraworks.co.za/aura.js" data-client-id="client-active-1" defer></script>',
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

  test('renders Admin console and loads Global Overview metrics', async () => {
    render(<AdminDashboardPage />);

    expect(screen.getAllByText('Admin Command').length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: /Global Overview/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Personnel Management/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Script Vault/i })).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('R250,000')).toBeInTheDocument();
      expect(screen.getByText('40%')).toBeInTheDocument();
      expect(screen.getByText('18')).toBeInTheDocument();
    });
  });

  test('loads real personnel data in TailAdmin table', async () => {
    render(<AdminDashboardPage />);

    // Switch to Personnel Management tab
    const personnelTab = screen.getByRole('button', { name: /Personnel Management/i });
    fireEvent.click(personnelTab);

    await waitFor(() => {
      expect(screen.getByText('Sarah Connor')).toBeInTheDocument();
      expect(screen.getByText('sarah@auraworks.co.za')).toBeInTheDocument();
      expect(screen.getByText('Senior Account Executive')).toBeInTheDocument();
      expect(screen.getByText('Active')).toBeInTheDocument();
    });
  });

  test('submits user registration modal and calls POST /api/v1/admin/users', async () => {
    render(<AdminDashboardPage />);

    const personnelTab = screen.getByRole('button', { name: /Personnel Management/i });
    fireEvent.click(personnelTab);

    await waitFor(() => {
      expect(screen.getByText('Sarah Connor')).toBeInTheDocument();
    });

    // Open Register Modal
    const registerBtn = screen.getByRole('button', { name: /Register User/i });
    fireEvent.click(registerBtn);

    expect(screen.getByText('Register New Personnel')).toBeInTheDocument();

    // Fill form fields
    fireEvent.change(screen.getByPlaceholderText(/e\.g\. Jane Doe/i), {
      target: { value: 'John Matrix' },
    });
    fireEvent.change(screen.getByPlaceholderText(/jane@auraworks\.co\.za/i), {
      target: { value: 'john@auraworks.co.za' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Minimum 6 characters/i), {
      target: { value: 'SecurePass123!' },
    });

    // Submit form
    const submitBtn = screen.getByRole('button', { name: /Register Personnel/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/admin/users'),
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('"name":"John Matrix"'),
        })
      );
    });
  });

  test('permission toggles dispatch PATCH /api/v1/admin/users/{id}/permissions', async () => {
    render(<AdminDashboardPage />);

    const personnelTab = screen.getByRole('button', { name: /Personnel Management/i });
    fireEvent.click(personnelTab);

    await waitFor(() => {
      expect(screen.getByText('Sarah Connor')).toBeInTheDocument();
    });

    // Find Calendar permission checkbox for Sarah Connor
    const calendarCheckbox = screen.getByLabelText(/Calendar permission for Sarah Connor/i);
    expect(calendarCheckbox).not.toBeChecked();

    fireEvent.click(calendarCheckbox);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/admin/users/rep_1/permissions'),
        expect.objectContaining({
          method: 'PATCH',
          body: expect.stringContaining('"permissions":["analytics","sales","calendar"]'),
        })
      );
    });
  });

  test('role and status changes dispatch PATCH /api/v1/admin/users/{id}', async () => {
    render(<AdminDashboardPage />);

    const personnelTab = screen.getByRole('button', { name: /Personnel Management/i });
    fireEvent.click(personnelTab);

    await waitFor(() => {
      expect(screen.getByText('Sarah Connor')).toBeInTheDocument();
    });

    // Change role select
    const roleSelect = screen.getByLabelText(/Role for Sarah Connor/i);
    fireEvent.change(roleSelect, { target: { value: 'admin' } });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/admin/users/rep_1'),
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({ role: 'admin' }),
        })
      );
    });

    // Toggle active status
    const statusBtn = screen.getByTitle(/Click to mark inactive/i);
    fireEvent.click(statusBtn);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/admin/users/rep_1'),
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({ is_active: false }),
        })
      );
    });
  });

  test('switching to Script Vault shows active client snippets and allows copy', async () => {
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn().mockResolvedValue(undefined),
      },
    });

    render(<AdminDashboardPage />);

    const scriptVaultTab = screen.getByRole('button', { name: /Script Vault/i });
    fireEvent.click(scriptVaultTab);

    await waitFor(() => {
      expect(screen.getByText('BHP Billiton Minerals')).toBeInTheDocument();
      expect(screen.getByText(/cdn\.auraworks\.co\.za\/aura\.js/i)).toBeInTheDocument();
    });

    const copyBtn = screen.getByRole('button', { name: /Copy Script Tag/i });
    fireEvent.click(copyBtn);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      '<script src="https://cdn.auraworks.co.za/aura.js" data-client-id="client-active-1" defer></script>'
    );
  });
});
