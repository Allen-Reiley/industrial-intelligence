import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoginPage from './page';
import { signIn } from '@/lib/auth-client';

jest.mock('@/lib/auth-client', () => ({
  signIn: {
    social: jest.fn(),
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

describe('LoginPage V2 Astryx SSO Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders Google OAuth login button with Astryx design language', () => {
    render(<LoginPage />);

    expect(screen.getByText(/AuraHQ Operations Portal/i)).toBeInTheDocument();
    expect(screen.getByText(/Single Sign-On Verified/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Continue with Google/i })).toBeInTheDocument();
  });

  test('clicking Google SSO triggers Better Auth signIn.social', async () => {
    (signIn.social as jest.Mock).mockResolvedValueOnce({ error: null });

    render(<LoginPage />);

    const ssoBtn = screen.getByRole('button', { name: /Continue with Google/i });
    fireEvent.click(ssoBtn);

    await waitFor(() => {
      expect(signIn.social).toHaveBeenCalledWith({
        provider: 'google',
        callbackURL: '/aurahq/sales',
      });
    });
  });
});
