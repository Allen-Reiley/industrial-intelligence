import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import DynamicCheckoutPage from './page';

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useParams: () => ({
    session_id: 'test-session-uuid-1234',
  }),
}));

describe('Dynamic Checkout Page Component Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders session details, 24-hour expiration badge, and pricing correctly', async () => {
    const futureDate = new Date(Date.now() + 20 * 3600 * 1000).toISOString();

    global.fetch = jest.fn().mockImplementation((url) => {
      if (url.includes('/api/v1/checkout/session/')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({
            session_id: 'test-session-uuid-1234',
            client_id: 'client-123',
            status: 'pending',
            expires_at: futureDate,
            amount: 1850000,
            plan: 'category-leader',
            business_name: 'Vanguard Industrial Corp',
            contact_email: 'finance@vanguard.co.za',
          }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({}),
      });
    });

    render(<DynamicCheckoutPage />);

    await waitFor(() => {
      expect(screen.getByText('Vanguard Industrial Corp')).toBeInTheDocument();
      expect(screen.getByText(/category leader/i)).toBeInTheDocument();
      expect(screen.getByText(/24h Session Window/i)).toBeInTheDocument();
    });

    const payButton = screen.getByRole('button', { name: /Start 14-Day Free Trial/i });
    expect(payButton).toBeDisabled();
  });

  test('displays 410 expired session notice when session is expired', async () => {
    global.fetch = jest.fn().mockImplementation((url) => {
      if (url.includes('/api/v1/checkout/session/')) {
        return Promise.resolve({
          ok: false,
          status: 410,
          json: async () => ({
            detail: 'Checkout session has expired. Please request a new checkout link.',
          }),
        });
      }
      return Promise.resolve({
        ok: false,
        status: 500,
      });
    });

    render(<DynamicCheckoutPage />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Checkout Session Expired/i })).toBeInTheDocument();
      expect(screen.getByText(/410 GONE/i)).toBeInTheDocument();
      expect(screen.getByText(/This secure checkout session expired after 24 hours/i)).toBeInTheDocument();
    });
  });

  test('submitting checkout hands off to Ikhokha payment gateway', async () => {
    const futureDate = new Date(Date.now() + 20 * 3600 * 1000).toISOString();

    global.fetch = jest.fn().mockImplementation((url) => {
      if (url.includes('/api/v1/checkout/session/') && !url.includes('/pay')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({
            session_id: 'test-session-uuid-1234',
            client_id: 'client-123',
            status: 'pending',
            expires_at: futureDate,
            amount: 1850000,
            plan: 'category-leader',
            business_name: 'Vanguard Industrial Corp',
            contact_email: 'finance@vanguard.co.za',
          }),
        });
      }
      if (url.includes('/pay')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({
            status: 'success',
            payment_url: 'https://vault.ikhokha.com/pay/ik_intent_9999',
            intent_id: 'ik_intent_9999',
          }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({}),
      });
    });

    render(<DynamicCheckoutPage />);

    await waitFor(() => {
      expect(screen.getByText('Vanguard Industrial Corp')).toBeInTheDocument();
    });

    // Accept T&C
    const tcCheckbox = screen.getByTestId('tc-checkbox');
    fireEvent.click(tcCheckbox);

    const payButton = screen.getByRole('button', { name: /Start 14-Day Free Trial/i });
    expect(payButton).not.toBeDisabled();
    fireEvent.click(payButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/checkout/session/test-session-uuid-1234/pay'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            redirect_url: 'http://localhost/checkout/test-session-uuid-1234?success=true',
            tc_accepted: true,
            tc_accepted_ip: null,
          }),
        })
      );
    });
  });
});
