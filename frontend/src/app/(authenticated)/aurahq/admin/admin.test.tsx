import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import AdminDashboard from './page';

// Mock next/navigation
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock window.URL.createObjectURL and navigator.clipboard
const mockCreateObjectURL = jest.fn();
const mockRevokeObjectURL = jest.fn();
const mockWriteText = jest.fn();

describe('AdminDashboard Component Tests', () => {
  const mockClients = [
    {
      id: 'client-uuid-1',
      company_name: 'Acme Corp',
      whitelisted_domains: ['acme.com'],
      subscription_status: 'active',
      require_consent_banner: true,
      collect_personal_data: true,
      is_active: true,
    },
    {
      id: 'client-uuid-2',
      company_name: 'Globex Corp',
      whitelisted_domains: ['globex.com'],
      subscription_status: 'trial',
      require_consent_banner: false,
      collect_personal_data: false,
      is_active: true,
    },
  ];

  const mockLeads = [
    {
      id: 'lead-1',
      name: 'John Doe',
      email: 'john@acme.com',
      position: 'Director of Engineering',
      department: 'Engineering',
      aura_id: 'aura-1',
      created_at: '2026-06-09T12:00:00Z',
      is_warm: true,
      company: {
        name: 'Acme Corp',
        domain: 'acme.com',
        industry: 'Manufacturing',
        total_visits: 5,
        is_verified: true,
      },
    },
  ];

  beforeAll(() => {
    window.URL.createObjectURL = mockCreateObjectURL;
    window.URL.revokeObjectURL = mockRevokeObjectURL;
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: mockWriteText,
      },
      writable: true,
      configurable: true,
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();

    // Mock global fetch
    global.fetch = jest.fn((url: string, options?: any) => {
      if (!options || options.credentials !== 'include') {
        return Promise.reject(new Error(`Missing credentials: 'include' option in request to ${url}`));
      }
      if (url.endsWith('/api/v1/clients/')) {
        if (options?.method === 'POST') {
          const body = JSON.parse(options.body);
          return Promise.resolve({
            ok: true,
            status: 201,
            json: async () => ({
              id: 'client-uuid-3',
              company_name: body.company_name,
              whitelisted_domains: body.whitelisted_domains,
              subscription_status: body.subscription_status,
              require_consent_banner: body.require_consent_banner,
              collect_personal_data: true,
              is_active: true,
            }),
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => mockClients,
        });
      }
      if (url.includes('/api/v1/clients/') && options?.method === 'PATCH') {
        const body = JSON.parse(options.body);
        return Promise.resolve({
          ok: true,
          json: async () => ({
            id: 'client-uuid-1',
            company_name: 'Acme Corp',
            whitelisted_domains: ['acme.com'],
            subscription_status: 'active',
            require_consent_banner: true,
            collect_personal_data: true,
            is_active: true,
            custom_monthly_amount: body.custom_monthly_amount,
            payment_method_token: 'token-abc'
          }),
        });
      }
      if (url.includes('/api/v1/leads/')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockLeads,
        });
      }
      if (url.includes('/verify')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ installed: false, visit_count: 2 }),
        });
      }
      if (url.includes('/api/v1/billing/transactions')) {
        return Promise.resolve({
          ok: true,
          json: async () => [
            {
              id: 'tx-1',
              client_id: 'client-uuid-1',
              amount: 1000000,
              currency: 'ZAR',
              status: 'successful',
              gateway_reference: 'mock_ref_123',
              payment_method_token: 'token-abc',
              created_at: '2026-06-09T12:00:00Z',
              updated_at: '2026-06-09T12:00:00Z'
            }
          ],
        });
      }
      if (url.includes('/api/v1/billing/simulate-webhook')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            status: 'success',
            message: 'Manual payment webhook simulation completed',
            transaction_id: 'new-tx-uuid',
            gateway_reference: 'mock_ref_999'
          }),
        });
      }
      return Promise.reject(new Error(`Unhandled request to ${url}`));
    }) as any;
  });

  test('renders AdminDashboard and fetches clients', async () => {
    render(<AdminDashboard />);

    // Loader is shown initially
    expect(screen.getByText(/Resolving Multi-Tenant Ledgers/i)).toBeInTheDocument();

    // Wait for the client list to load and select first client (check heading role)
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Acme Corp', level: 2 })).toBeInTheDocument();
    });

    // Check table content asynchronously since fetchLeads resolves later
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('john@acme.com')).toBeInTheDocument();
      expect(screen.getByText('Director of Engineering')).toBeInTheDocument();
      expect(screen.getByText('Awaiting Tracking')).toBeInTheDocument();
    });
  });

  test('allows registering a new client tenant via the modal', async () => {
    render(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Acme Corp', level: 2 })).toBeInTheDocument();
    });

    // Open Register Modal
    const registerButton = screen.getByRole('button', { name: /Register Tenant/i });
    fireEvent.click(registerButton);

    expect(screen.getByRole('heading', { name: 'Register New Tenant', level: 3 })).toBeInTheDocument();

    // Fill the form
    const nameInput = screen.getByLabelText(/Company Name/i);
    const domainsInput = screen.getByLabelText(/Whitelisted Domains/i);
    const consentCheckbox = screen.getByLabelText(/Require Consent Banner/i);
    const subSelect = screen.getByLabelText(/Subscription Status/i);

    fireEvent.change(nameInput, { target: { value: 'Initech Corp' } });
    fireEvent.change(domainsInput, { target: { value: 'initech.com, test.initech.com' } });
    fireEvent.click(consentCheckbox);
    fireEvent.change(subSelect, { target: { value: 'active' } });

    // Submit form
    const submitButton = screen.getByRole('button', { name: /Register Profile/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/clients/'),
        expect.objectContaining({
          method: 'POST',
          credentials: 'include',
          body: JSON.stringify({
            company_name: 'Initech Corp',
            whitelisted_domains: ['initech.com', 'test.initech.com'],
            require_consent_banner: true,
            subscription_status: 'active',
            is_active: true,
          }),
        })
      );
    });

    // Modal should close
    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: 'Register New Tenant', level: 3 })).not.toBeInTheDocument();
    });
  });

  test('allows copying script snippet tag to clipboard', async () => {
    render(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Acme Corp', level: 2 })).toBeInTheDocument();
    });

    // Open Script Tag Modal
    const scriptTagBtn = screen.getByRole('button', { name: /Script Tag/i });
    fireEvent.click(scriptTagBtn);

    expect(screen.getByRole('heading', { name: 'Edge Deployment Tag', level: 3 })).toBeInTheDocument();

    // Verify script contents are rendered
    const scriptCode = screen.getByText(/data-client-id="client-uuid-1"/i);
    expect(scriptCode).toBeInTheDocument();

    // Click Copy to Clipboard
    const copyButton = screen.getByTitle('Copy snippet to clipboard');
    fireEvent.click(copyButton);

    expect(mockWriteText).toHaveBeenCalledWith(
      '<script src="https://cdn.auraworks.co.za/aura.js" data-client-id="client-uuid-1" defer></script>'
    );
  });

  test('polls status endpoint and registers verification updates', async () => {
    jest.useFakeTimers();
    let simulateInstalled = false;

    global.fetch = jest.fn((url: string, options?: any) => {
      if (!options || options.credentials !== 'include') {
        return Promise.reject(new Error(`Missing credentials: 'include' option in request to ${url}`));
      }
      if (url.endsWith('/api/v1/clients/')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockClients,
        });
      }
      if (url.includes('/api/v1/leads/')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockLeads,
        });
      }
      if (url.includes('/verify')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            installed: simulateInstalled,
            visit_count: simulateInstalled ? 12 : 0,
          }),
        });
      }
      if (url.includes('/api/v1/billing/transactions')) {
        return Promise.resolve({
          ok: true,
          json: async () => [],
        });
      }
      return Promise.reject(new Error(`Unhandled request to ${url}`));
    }) as any;

    render(<AdminDashboard />);

    // Wait for the client list to load and select first client
    await act(async () => {
      jest.advanceTimersByTime(0);
    });

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Acme Corp', level: 2 })).toBeInTheDocument();
    });

    // Verify initial "Awaiting Tracking" state
    await waitFor(() => {
      expect(screen.getByText('Awaiting Tracking')).toBeInTheDocument();
    });

    // Fast-forward 5 seconds (simulateInstalled is still false, so state shouldn't change)
    await act(async () => {
      await jest.advanceTimersByTimeAsync(5000);
    });

    expect(screen.getByText('Awaiting Tracking')).toBeInTheDocument();

    // Enable simulated installation
    simulateInstalled = true;

    // Fast-forward another 5 seconds to trigger status poll and verify it flips to "Installed & Active"
    await act(async () => {
      await jest.advanceTimersByTimeAsync(5000);
    });

    await waitFor(() => {
      expect(screen.getByText('Installed & Active')).toBeInTheDocument();
    });
  });

  test('renders Billing Hub and Transaction History when client loaded', async () => {
    render(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Acme Corp', level: 2 })).toBeInTheDocument();
    });

    // Verify Billing Hub elements exist
    expect(screen.getByRole('heading', { name: 'Billing Hub', level: 3 })).toBeInTheDocument();
    expect(screen.getByText('Subscription State:')).toBeInTheDocument();
    expect(screen.getByText('Payment Method:')).toBeInTheDocument();
    expect(screen.getByText('Last Charge:')).toBeInTheDocument();

    // Verify Monthly Amount input
    const monthlyRateInput = screen.getByLabelText(/Monthly Amount \(ZAR\)/i);
    expect(monthlyRateInput).toBeInTheDocument();
    expect(monthlyRateInput).toHaveValue(10000);

    // Verify Ledger History table content is loaded
    expect(screen.getByRole('heading', { name: 'Ledger History', level: 3 })).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('R10,000')).toBeInTheDocument();
      expect(screen.getByText('Ref: mock_ref_1...')).toBeInTheDocument();
    });
  });

  test('allows editing and saving custom monthly billing amount', async () => {
    render(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Acme Corp', level: 2 })).toBeInTheDocument();
    });

    const monthlyRateInput = screen.getByLabelText(/Monthly Amount \(ZAR\)/i);
    const saveButton = screen.getByTitle('Save monthly amount');

    // Change input value
    fireEvent.change(monthlyRateInput, { target: { value: '15000' } });
    expect(monthlyRateInput).toHaveValue(15000);

    // Save
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/clients/client-uuid-1'),
        expect.objectContaining({
          method: 'PATCH',
          credentials: 'include',
          body: JSON.stringify({ custom_monthly_amount: 1500000 })
        })
      );
    });
  });

  test('allows manual webhook simulation trigger', async () => {
    render(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Acme Corp', level: 2 })).toBeInTheDocument();
    });

    const simulateSelect = screen.getByLabelText(/Simulation Tool/i);
    const triggerBtn = screen.getByRole('button', { name: /Trigger/i });

    // Choose failure simulation
    fireEvent.change(simulateSelect, { target: { value: 'failed' } });

    // Click trigger
    fireEvent.click(triggerBtn);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/billing/simulate-webhook'),
        expect.objectContaining({
          method: 'POST',
          credentials: 'include',
          body: JSON.stringify({
            client_id: 'client-uuid-1',
            status: 'failed',
            amount: 1000000
          })
        })
      );
    });
  });

  test('strictly verifies that credentials: include is passed for initial GET requests', async () => {
    render(<AdminDashboard />);
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Acme Corp', level: 2 })).toBeInTheDocument();
    });

    const calls = (global.fetch as jest.Mock).mock.calls;
    expect(calls.length).toBeGreaterThan(0);
    calls.forEach(([url, options]) => {
      expect(options).toBeDefined();
      expect(options.credentials).toBe('include');
    });
  });
});
