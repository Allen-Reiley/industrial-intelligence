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
    
    expect(screen.getByText('AuraHQ Portal')).toBeInTheDocument();
    expect(screen.getByText('Login with Google')).toBeInTheDocument();
    expect(screen.getByLabelText(/System Username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Security Key/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Initialize Console/i })).toBeInTheDocument();
  });

  test('handles successful credentials login with redirect', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
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
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: expect.any(URLSearchParams),
        })
      );
    });

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/aurahq/dashboard');
    });
  });

  test('handles Login with Google button click', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ authorization_url: 'https://accounts.google.com/o/oauth2/auth?state=123' }),
    });

    const originalLocation = window.location;
    const mockLocation = {
      href: '',
      origin: 'http://localhost:3000',
    };
    Object.defineProperty(window, 'location', {
      value: mockLocation,
      writable: true,
      configurable: true,
    });

    render(<LoginPage />);

    fireEvent.click(screen.getByRole('button', { name: /Login with Google/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/auth/google/authorize?redirect_uri=')
      );
    });

    await waitFor(() => {
      expect(window.location.href).toBe('https://accounts.google.com/o/oauth2/auth?state=123');
    });

    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true,
      configurable: true,
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
      expect(mockPush).not.toHaveBeenCalled();
    });
  });
});
