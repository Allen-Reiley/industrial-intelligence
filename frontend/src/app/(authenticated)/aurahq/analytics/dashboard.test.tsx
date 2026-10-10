import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import UnifiedDashboard from './page';

// Mock next/navigation
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('UnifiedDashboard Component Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially, fetches clients, and then fetches leads with client_id and trailing slash', async () => {
    const mockClients = [
      {
        id: 'client-uuid-1',
        company_name: 'Mining Corp Support',
        whitelisted_domains: ['mining-corp.co.za'],
        subscription_status: 'active',
        require_consent_banner: true,
        collect_personal_data: true,
        is_active: true,
      }
    ];

    const mockLeads = [
      {
        id: 'lead-1',
        name: 'John Doe',
        company_name: 'Mining Corp',
        email: 'john@mining-corp.co.za',
        position: 'Operations Manager',
        department: 'Operations',
        ip_address: '196.25.1.1',
        city: 'Johannesburg',
        region: 'Gauteng',
        country: 'South Africa',
        duration: 45,
        url: '/specs/drill-press',
        referrer: 'https://google.com',
        created_at: '2026-06-14T12:00:00Z',
        hit_count: 3,
        is_b2b: true,
        industry: 'Mining',
      }
    ];

    const mockFetch = jest.fn((url: string, options?: any) => {
      if (url.includes('/api/v1/clients/')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => mockClients,
        });
      }
      if (url.includes('/api/v1/leads/')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => mockLeads,
        });
      }
      return Promise.reject(new Error(`Unhandled URL: ${url}`));
    });
    global.fetch = mockFetch;

    render(<UnifiedDashboard />);

    // Check loading indicator first
    expect(screen.getByText(/Synchronizing Intelligence.../i)).toBeInTheDocument();

    // Wait for the leads to load
    await waitFor(() => {
      expect(screen.getByText('Mining Corp')).toBeInTheDocument();
    });

    // Check that fetch was called for clients
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/clients/'),
      expect.objectContaining({
        credentials: 'include'
      })
    );

    // Verify trailing slash and query param on leads fetch call
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/leads/?client_id=client-uuid-1'),
      expect.objectContaining({
        credentials: 'include'
      })
    );
  });
});
