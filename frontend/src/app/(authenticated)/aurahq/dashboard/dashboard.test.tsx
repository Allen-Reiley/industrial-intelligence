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

  it('renders loading state initially and then fetches leads with credentials include', async () => {
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

    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockLeads,
    });
    global.fetch = mockFetch;

    render(<UnifiedDashboard />);

    // Check loading indicator first
    expect(screen.getByText(/Synchronizing Intelligence.../i)).toBeInTheDocument();

    // Wait for the leads to load
    await waitFor(() => {
      expect(screen.getByText('Mining Corp')).toBeInTheDocument();
    });

    // Check that fetch was called with credentials include
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/leads'),
      expect.objectContaining({
        credentials: 'include'
      })
    );
  });
});
