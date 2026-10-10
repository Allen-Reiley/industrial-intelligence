import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoginPage from './page';
import { signIn, signUp } from '@/lib/auth-client';
import { ThemeProvider } from '@/context/ThemeContext';

jest.mock('@/icons', () => ({
  EyeCloseIcon: () => <svg data-testid="eye-close-icon" />,
  EyeIcon: () => <svg data-testid="eye-icon" />,
  GridIcon: () => <svg data-testid="grid-icon" />,
}));

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

const renderWithTheme = (ui: React.ReactElement) => {
  return render(
    <ThemeProvider>{ui}</ThemeProvider>
  );
};

describe('LoginPage V2 Astryx Multi-Method Auth Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders multi-method auth options (Google, GitHub, Email/Password)', () => {
    renderWithTheme(<LoginPage />);

    expect(screen.getByRole('heading', { name: /Sign In/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Google/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /GitHub/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
  });

  test('clicking Google SSO triggers Better Auth signIn.social', async () => {
    (signIn.social as jest.Mock).mockResolvedValueOnce({ error: null });

    renderWithTheme(<LoginPage />);

    const googleBtn = screen.getByRole('button', { name: /Google/i });
    fireEvent.click(googleBtn);

    await waitFor(() => {
      expect(signIn.social).toHaveBeenCalledWith({
        provider: 'google',
        callbackURL: '/aurahq',
      });
    });
  });

  test('clicking GitHub SSO triggers Better Auth signIn.social with github', async () => {
    (signIn.social as jest.Mock).mockResolvedValueOnce({ error: null });

    renderWithTheme(<LoginPage />);

    const githubBtn = screen.getByRole('button', { name: /GitHub/i });
    fireEvent.click(githubBtn);

    await waitFor(() => {
      expect(signIn.social).toHaveBeenCalledWith({
        provider: 'github',
        callbackURL: '/aurahq',
      });
    });
  });

  test('signing in with email and password triggers signIn.email', async () => {
    (signIn.email as jest.Mock).mockResolvedValueOnce({ error: null });

    renderWithTheme(<LoginPage />);

    const emailInput = screen.getByPlaceholderText(/info@company\.co\.za/i);
    const passwordInput = screen.getByPlaceholderText(/Enter your password/i);

    fireEvent.change(emailInput, { target: { value: 'rep@auraworks.co.za' } });
    fireEvent.change(passwordInput, { target: { value: 'SecurePassword123!' } });

    const submitBtn = screen.getByRole('button', { name: 'Sign In' });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(signIn.email).toHaveBeenCalledWith({
        email: 'rep@auraworks.co.za',
        password: 'SecurePassword123!',
        callbackURL: '/aurahq',
      });
      expect(mockPush).toHaveBeenCalledWith('/aurahq');
    });
  });

  test('switching to Sign Up tab and submitting triggers signUp.email', async () => {
    (signUp.email as jest.Mock).mockResolvedValueOnce({ error: null });

    renderWithTheme(<LoginPage />);

    const signUpToggleBtn = screen.getByRole('button', { name: /Sign Up/i });
    fireEvent.click(signUpToggleBtn);

    expect(screen.getByPlaceholderText(/Jordan Belfort/i)).toBeInTheDocument();

    const nameInput = screen.getByPlaceholderText(/Jordan Belfort/i);
    const emailInput = screen.getByPlaceholderText(/info@company\.co\.za/i);
    const passwordInput = screen.getByPlaceholderText(/Enter your password/i);
    const confirmPasswordInput = screen.getByPlaceholderText(/Confirm your password/i);

    fireEvent.change(nameInput, { target: { value: 'Jordan Belfort' } });
    fireEvent.change(emailInput, { target: { value: 'jordan@auraworks.co.za' } });
    fireEvent.change(passwordInput, { target: { value: 'SecretP@ssword123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'SecretP@ssword123' } });

    const submitBtn = screen.getByRole('button', { name: 'Sign Up' });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(signUp.email).toHaveBeenCalledWith({
        email: 'jordan@auraworks.co.za',
        password: 'SecretP@ssword123',
        name: 'Jordan Belfort',
        callbackURL: '/aurahq',
      });
    });
  });
});
