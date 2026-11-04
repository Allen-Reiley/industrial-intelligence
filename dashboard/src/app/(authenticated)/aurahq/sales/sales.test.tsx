import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SWRConfig } from 'swr';
import SalesPortalPage from './page';

jest.mock('@/lib/auth-client', () => ({
  useSession: jest.fn(() => ({
    data: {
      user: {
        id: 'sales_rep_1',
        name: 'Jordan Belfort',
        email: 'jordan@auraworks.co.za',
        role: 'sales',
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

const renderWithSWR = (ui: React.ReactElement) => {
  return render(
    <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>
      {ui}
    </SWRConfig>
  );
};

describe('Sales Portal V2 Component & Integration Tests', () => {
  let mockFetch: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch = jest.fn().mockImplementation((url: string, options?: any) => {
      if (url.includes('/api/v1/sales/metrics')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            sales_rep_id: 'sales_rep_1',
            sales_rep_name: 'Jordan Belfort',
            total_links_generated: 12,
            successful_conversions: 5,
            pending_links: 7,
            conversion_rate_percentage: 41.7,
            active_pipeline_cents: 9250000,
            active_pipeline_zar: 92500.0,
          }),
        });
      }

      if (url.includes('/api/v1/sales/checkouts')) {
        return Promise.resolve({
          ok: true,
          json: async () => [
            {
              session_id: 'session-1',
              id: 'session-1',
              client_id: 'client-1',
              sales_rep_id: 'sales_rep_1',
              status: 'paid',
              expires_at: new Date(Date.now() + 10 * 3600 * 1000).toISOString(),
              created_at: new Date(Date.now() - 3600 * 1000).toISOString(),
              amount: 1850000,
              amount_zar: 18500,
              plan: 'category-leader',
              business_name: 'Transnet Engineering',
              contact_email: 'procurement@transnet.co.za',
              is_expired: false,
            },
          ],
        });
      }

      if (url.includes('/api/v1/checkout/generate')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            status: 'success',
            session_id: 'new-session-uuid',
            checkout_url: '/checkout/new-session-uuid',
            expires_at: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
            business_name: 'Anglo American',
            amount: 1000000,
            amount_zar: 10000,
            plan: 'growth-foundation',
          }),
        });
      }

      return Promise.resolve({
        ok: true,
        json: async () => ({}),
      });
    });

    global.fetch = mockFetch;
  });

  test('renders Sales Portal KPI cards, link generator form, and polling feed', async () => {
    renderWithSWR(<SalesPortalPage />);

    expect(screen.getAllByText('Sales Portal').length).toBeGreaterThan(0);
    expect(screen.getByText(/Dynamic Link Generator/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Transnet Engineering')).toBeInTheDocument();
      expect(screen.getByText('R92,500')).toBeInTheDocument();
      expect(screen.getByText('41.7%')).toBeInTheDocument();
      expect(screen.getByText('Payment Confirmed')).toBeInTheDocument();
    });
  });

  test('generating a checkout link sends POST to /api/v1/checkout/generate and displays copyable URL card', async () => {
    renderWithSWR(<SalesPortalPage />);

    const nameInput = screen.getByPlaceholderText(/e\.g\. Rand Mining Technologies/i);
    const emailInput = screen.getByPlaceholderText(/director@miningtech\.co\.za/i);

    fireEvent.change(nameInput, { target: { value: 'Anglo American' } });
    fireEvent.change(emailInput, { target: { value: 'procurement@anglo.com' } });

    const generateBtn = screen.getByRole('button', { name: /Create 24h Checkout Link/i });
    fireEvent.click(generateBtn);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/checkout/generate'),
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('"business_name":"Anglo American"'),
        })
      );
      expect(screen.getByText(/Active Checkout Link for Anglo American/i)).toBeInTheDocument();
      expect(screen.getByDisplayValue(/new-session-uuid/i)).toBeInTheDocument();
    });
  });

  test('dual-mode link generator switches to Marketing Affiliate mode and produces trackable URL', async () => {
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn().mockResolvedValue(undefined),
      },
    });

    renderWithSWR(<SalesPortalPage />);

    // Switch to Marketing Affiliate mode
    const affiliateTab = screen.getByRole('button', { name: /Marketing Affiliate/i });
    fireEvent.click(affiliateTab);

    expect(screen.getByText(/Live Trackable Link Preview/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue(/ref=sales_rep_1/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue(/utm_source=sales/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue(/utm_campaign=outreach/i)).toBeInTheDocument();

    // Copy affiliate link
    const copyBtn = screen.getByRole('button', { name: /Copy Link/i });
    fireEvent.click(copyBtn);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      expect.stringContaining('ref=sales_rep_1')
    );
  });

  test('scopes checkout and metrics queries with authenticated sales_rep_id', async () => {
    renderWithSWR(<SalesPortalPage />);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/sales/checkouts?sales_rep_id=sales_rep_1'),
        expect.anything()
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/sales/metrics?sales_rep_id=sales_rep_1'),
        expect.anything()
      );
    });
  });
});
