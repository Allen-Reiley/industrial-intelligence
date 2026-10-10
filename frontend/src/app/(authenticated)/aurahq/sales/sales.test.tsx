import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
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

describe('Sales Portal V2 Component Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn().mockImplementation((url) => {
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
              amount: 1850000,
              amount_zar: 18500,
              plan: 'category-leader',
              business_name: 'Transnet Engineering',
              contact_email: 'procurement@transnet.co.za',
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
  });

  test('renders KPI cards, link generator form, and polling feed', async () => {
    render(<SalesPortalPage />);

    expect(screen.getByText('Sales Portal')).toBeInTheDocument();
    expect(screen.getByText(/Generate Dynamic 24-Hour Checkout Link/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Transnet Engineering')).toBeInTheDocument();
      expect(screen.getByText('R92,500')).toBeInTheDocument();
      expect(screen.getByText('41.7%')).toBeInTheDocument();
    });
  });

  test('generating a checkout link displays the copyable URL card', async () => {
    render(<SalesPortalPage />);

    const nameInput = screen.getByPlaceholderText(/e\.g\. Rand Mining Technologies/i);
    const emailInput = screen.getByPlaceholderText(/director@miningtech\.co\.za/i);

    fireEvent.change(nameInput, { target: { value: 'Anglo American' } });
    fireEvent.change(emailInput, { target: { value: 'procurement@anglo.com' } });

    const generateBtn = screen.getByRole('button', { name: /Create 24h Checkout Link/i });
    fireEvent.click(generateBtn);

    await waitFor(() => {
      expect(screen.getByText(/Active Checkout Link for Anglo American/i)).toBeInTheDocument();
      expect(screen.getByDisplayValue(/new-session-uuid/i)).toBeInTheDocument();
    });
  });
});
