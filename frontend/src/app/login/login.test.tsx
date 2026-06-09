import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoginPage from './page';

// Mock next/navigation
const mockPush = jest.fn();
const mockGet = jest.fn().mockReturnValue(null);
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => ({
    get: mockGet,
  }),
}));

describe('LoginPage Component Tests', () => {
  let cookieVal = '';

  beforeEach(() => {
    jest.clearAllMocks();
    cookieVal = '';
    Object.defineProperty(document, 'cookie', {
      get: () => cookieVal,
      set: (val) => {
        cookieVal = val;
      },
      configurable: true,
    });
    global.fetch = jest.fn();
  });

  test('renders login form elements correctly', () => {
    render(<LoginPage />);
    
    expect(screen.getByText('AuraWorks OS')).toBeInTheDocument();
    expect(screen.getByLabelText(/System Username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Security Key/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Initialize Console/i })).toBeInTheDocument();
  });

  test('handles successful login with cookie storage and redirect', async () => {
    const fakeToken = 'fake-jwt-token';
    const fakeRefreshToken = 'fake-refresh-token';
    
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ access_token: fakeToken, refresh_token: fakeRefreshToken }),
    });

    render(<LoginPage />);

    fireEvent.change(screen.getByPlaceholderText('admin'), { target: { value: 'admin' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••••••'), { target: { value: 'secretkey' } });
    
    fireEvent.click(screen.getByRole('button', { name: /Initialize Console/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/auth/login'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: 'admin', password: 'secretkey' }),
        })
      );
    });

    await waitFor(() => {
      expect(document.cookie).toContain('admin_access_token=fake-jwt-token');
      expect(mockPush).toHaveBeenCalledWith('/admin');
    });
  });

  test('handles login failure and displays error alert', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 401,
    });

    render(<LoginPage />);

    fireEvent.change(screen.getByPlaceholderText('admin'), { target: { value: 'admin' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••••••'), { target: { value: 'wrongkey' } });
    
    fireEvent.click(screen.getByRole('button', { name: /Initialize Console/i }));

    await waitFor(() => {
      expect(screen.getByText('Invalid administrative credentials.')).toBeInTheDocument();
      expect(document.cookie).not.toContain('admin_access_token=');
      expect(mockPush).not.toHaveBeenCalled();
    });
  });
});
