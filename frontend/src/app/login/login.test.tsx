import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoginPage from './page';
import { signIn, signUp } from '@/lib/auth-client';

jest.mock('@/lib/auth-client', () => ({
  signIn: {
    social: jest.fn(),
    email: jest.fn(),
  },
  signUp: {
    email: jest.fn(),
  },
  useSession: jest.fn(() => ({ data: null, isPending: false })),
}));

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => ({
    get: jest.fn().mockReturnValue(null),
  }),
}));

describe('LoginPage V2 Astryx Multi-Method Auth Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders multi-method auth options (Google, GitHub, Email/Password)', () => {
    render(<LoginPage />);

    expect(screen.getByText(/AuraHQ Operations Portal/i)).toBeInTheDocument();
    expect(screen.getByText(/Multi-Method Auth/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Continue with Google/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Continue with GitHub/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign In with Email/i })).toBeInTheDocument();
  });

  test('clicking Google SSO triggers Better Auth signIn.social', async () => {
    (signIn.social as jest.Mock).mockResolvedValueOnce({ error: null });

    render(<LoginPage />);

    const googleBtn = screen.getByRole('button', { name: /Continue with Google/i });
    fireEvent.click(googleBtn);

    await waitFor(() => {
      expect(signIn.social).toHaveBeenCalledWith({
        provider: 'google',
        callbackURL: '/aurahq/sales',
      });
    });
  });

  test('clicking GitHub SSO triggers Better Auth signIn.social with github', async () => {
    (signIn.social as jest.Mock).mockResolvedValueOnce({ error: null });

    render(<LoginPage />);

    const githubBtn = screen.getByRole('button', { name: /Continue with GitHub/i });
    fireEvent.click(githubBtn);

    await waitFor(() => {
      expect(signIn.social).toHaveBeenCalledWith({
        provider: 'github',
        callbackURL: '/aurahq/sales',
      });
    });
  });

  test('signing in with email and password triggers signIn.email', async () => {
    (signIn.email as jest.Mock).mockResolvedValueOnce({ error: null });

    render(<LoginPage />);

    const emailInput = screen.getByPlaceholderText(/name@company\.co\.za/i);
    const passwordInput = screen.getByPlaceholderText(/••••••••••••/i);

    fireEvent.change(emailInput, { target: { value: 'rep@auraworks.co.za' } });
    fireEvent.change(passwordInput, { target: { value: 'SecurePassword123!' } });

    const submitBtn = screen.getByRole('button', { name: /Sign In with Email/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(signIn.email).toHaveBeenCalledWith({
        email: 'rep@auraworks.co.za',
        password: 'SecurePassword123!',
        callbackURL: '/aurahq/sales',
      });
      expect(mockPush).toHaveBeenCalledWith('/aurahq/sales');
    });
  });

  test('switching to Create Account tab and submitting triggers signUp.email', async () => {
    (signUp.email as jest.Mock).mockResolvedValueOnce({ error: null });

    render(<LoginPage />);

    const createAccountTab = screen.getByRole('button', { name: /Create Account/i });
    fireEvent.click(createAccountTab);

    expect(screen.getByPlaceholderText(/e\.g\. Jordan Belfort/i)).toBeInTheDocument();

    const nameInput = screen.getByPlaceholderText(/e\.g\. Jordan Belfort/i);
    const emailInput = screen.getByPlaceholderText(/name@company\.co\.za/i);
    const passwordInputs = screen.getAllByPlaceholderText(/••••••••••••/i);

    fireEvent.change(nameInput, { target: { value: 'Jordan Belfort' } });
    fireEvent.change(emailInput, { target: { value: 'jordan@auraworks.co.za' } });
    fireEvent.change(passwordInputs[0], { target: { value: 'SecretP@ssword123' } });
    fireEvent.change(passwordInputs[1], { target: { value: 'SecretP@ssword123' } });

    const registerBtn = screen.getByRole('button', { name: /Register Account/i });
    fireEvent.click(registerBtn);

    await waitFor(() => {
      expect(signUp.email).toHaveBeenCalledWith({
        email: 'jordan@auraworks.co.za',
        password: 'SecretP@ssword123',
        name: 'Jordan Belfort',
        callbackURL: '/aurahq/sales',
      });
    });
  });
});
