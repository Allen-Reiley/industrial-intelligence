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
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('Admin Console V2 Component Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn().mockImplementation((url) => {
      if (url.includes('/api/v1/admin/users')) {
        return Promise.resolve({
          ok: true,
          json: async () => [
            {
              id: 'rep_1',
              name: 'Sarah Connor',
              email: 'sarah@auraworks.co.za',
              role: 'sales',
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
  });

  test('renders Astryx Admin console with tabs: Personnel, Global Overview, Script Vault', async () => {
    render(<AdminDashboardPage />);

    expect(screen.getByText('Admin Command')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Personnel Management/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Global Overview/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Script Vault/i })).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('R250,000')).toBeInTheDocument();
      expect(screen.getByText('40%')).toBeInTheDocument();
    });

    // Switch to Personnel Management tab
    const personnelTab = screen.getByRole('button', { name: /Personnel Management/i });
    fireEvent.click(personnelTab);

    await waitFor(() => {
      expect(screen.getByText('Sarah Connor')).toBeInTheDocument();
      expect(screen.getByText('sarah@auraworks.co.za')).toBeInTheDocument();
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

    const copyBtn = screen.getByRole('button', { name: /Copy Script/i });
    fireEvent.click(copyBtn);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      '<script src="https://cdn.auraworks.co.za/aura.js" data-client-id="client-active-1" defer></script>'
    );
  });
});
