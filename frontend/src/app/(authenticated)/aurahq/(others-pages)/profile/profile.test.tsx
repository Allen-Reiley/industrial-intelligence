import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProfilePage from './page';
import { SWRConfig } from 'swr';

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
  }),
}));

const mockSignOut = jest.fn((options?: any) => {
  options?.fetchOptions?.onSuccess?.();
  return Promise.resolve({ success: true });
});

const mockSession = {
  data: {
    user: {
      id: 'usr_sarah',
      name: 'Sarah Connor',
      email: 'sarah@auraworks.co.za',
      role: 'sales',
      job_title: 'Senior Account Executive',
      image: '/images/user/owner.png',
    },
  },
  isPending: false,
};

jest.mock('@/lib/auth-client', () => ({
  useSession: () => mockSession,
  signOut: (opts: any) => mockSignOut(opts),
  authClient: {
    changePassword: jest.fn().mockResolvedValue({ error: null }),
    signOut: (opts: any) => mockSignOut(opts),
  },
}));

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, ...props }: any) => <img src={src} alt={alt} {...props} />,
}));

describe('User Profile Integration Tests', () => {
  let mockFetch: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch = jest.fn().mockImplementation((url: string, options?: any) => {
      if (url.includes('/api/v1/auth/me') && options?.method === 'PATCH') {
        const body = JSON.parse(options.body);
        return Promise.resolve({
          ok: true,
          json: async () => ({
            status: 'success',
            user: {
              id: 'usr_sarah',
              name: body.name || 'Sarah Connor',
              email: 'sarah@auraworks.co.za',
              job_title: body.job_title || 'Senior Account Executive',
              image: body.image || '/images/user/owner.png',
              role: 'sales',
            },
          }),
        });
      }

      if (url.includes('/api/v1/auth/me')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            id: 'usr_sarah',
            name: 'Sarah Connor',
            email: 'sarah@auraworks.co.za',
            role: 'sales',
            job_title: 'Senior Account Executive',
            image: '/images/user/owner.png',
          }),
        });
      }

      if (url.includes('/api/v1/auth/logout') && options?.method === 'POST') {
        return Promise.resolve({
          ok: true,
          json: async () => ({ status: 'success' }),
        });
      }

      return Promise.resolve({
        ok: true,
        json: async () => ({}),
      });
    });

    global.fetch = mockFetch;
  });

  const renderWithSWR = () => {
    return render(
      <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>
        <ProfilePage />
      </SWRConfig>
    );
  };

  test('renders Profile page with dynamic session data and cards', async () => {
    renderWithSWR();

    expect(screen.getAllByText('Profile').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Sarah Connor').length).toBeGreaterThan(0);
    expect(screen.getByText('sarah@auraworks.co.za')).toBeInTheDocument();
    expect(screen.getAllByText('Senior Account Executive').length).toBeGreaterThan(0);
    expect(screen.getByText('SALES')).toBeInTheDocument();
    expect(screen.getByText('Regional Operating Base & Tax Jurisdiction')).toBeInTheDocument();
    expect(screen.getByText('Security & Access Credentials')).toBeInTheDocument();
    expect(screen.getByText('Danger Zone')).toBeInTheDocument();
  });

  test('edits user profile and submits PATCH /api/v1/auth/me', async () => {
    renderWithSWR();

    const editProfileBtn = screen.getByRole('button', { name: /Edit Profile/i });
    fireEvent.click(editProfileBtn);

    expect(screen.getByText('Edit Personnel Profile')).toBeInTheDocument();

    const nameInput = screen.getByLabelText(/Full Name \*/i);
    fireEvent.change(nameInput, { target: { value: 'Sarah Connor-Reese' } });

    const jobInput = screen.getByLabelText(/Job Title \/ Designation/i);
    fireEvent.change(jobInput, { target: { value: 'Principal Account Director' } });

    const saveBtn = screen.getByRole('button', { name: /Save Changes/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/auth/me'),
        expect.objectContaining({
          method: 'PATCH',
          body: expect.stringContaining('"name":"Sarah Connor-Reese"'),
        })
      );
    });
  });

  test('edits regional base preferences and updates card display', async () => {
    renderWithSWR();

    const editBaseBtn = screen.getByRole('button', { name: /Edit Base/i });
    fireEvent.click(editBaseBtn);

    expect(screen.getByText('Edit Regional Base')).toBeInTheDocument();

    const regionInput = screen.getByLabelText(/Regional Office/i);
    fireEvent.change(regionInput, { target: { value: 'Cape Town, Western Cape' } });

    const saveBtn = screen.getByRole('button', { name: /Save Preferences/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(screen.getByText('Cape Town, Western Cape')).toBeInTheDocument();
    });
  });

  test('handles change password modal flow', async () => {
    renderWithSWR();

    const changePasswordBtn = screen.getByRole('button', { name: /Change Password/i });
    fireEvent.click(changePasswordBtn);

    expect(screen.getByRole('heading', { name: /Update Password/i })).toBeInTheDocument();

    const currentPass = screen.getByLabelText(/Current Password \*/i);
    const newPass = screen.getByLabelText(/^New Password \*/i);
    const confirmPass = screen.getByLabelText(/Confirm New Password \*/i);

    fireEvent.change(currentPass, { target: { value: 'OldSecretPass123' } });
    fireEvent.change(newPass, { target: { value: 'NewSuperSecretPass456' } });
    fireEvent.change(confirmPass, { target: { value: 'NewSuperSecretPass456' } });

    const updateBtn = screen.getByRole('button', { name: /Update Password/i });
    fireEvent.click(updateBtn);

    await waitFor(() => {
      expect(screen.getByText(/Password successfully changed/i)).toBeInTheDocument();
    });
  });

  test('executes logout all sessions flow in Danger Zone', async () => {
    renderWithSWR();

    const logoutAllBtn = screen.getByRole('button', { name: /Logout All Sessions/i });
    fireEvent.click(logoutAllBtn);

    expect(screen.getByText('Sign Out All Sessions?')).toBeInTheDocument();

    const confirmBtn = screen.getByRole('button', { name: /Sign Out Everywhere/i });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/auth/logout'),
        expect.objectContaining({
          method: 'POST',
        })
      );
      expect(mockSignOut).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith('/login');
    });
  });
});
