import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './LoginPage';
import { AuthProvider } from '../context/AuthContext';
import { authService } from '../../../services/auth.service';
import type { AxiosError } from 'axios';

vi.mock('../../../services/auth.service', () => ({
  authService: {
    login: vi.fn(),
    register: vi.fn(),
    googleLogin: vi.fn(),
    logout: vi.fn(),
    getToken: vi.fn(),
  },
}));

function createAxiosError(message: string, status = 400): AxiosError {
  return {
    isAxiosError: true,
    name: 'AxiosError',
    message,
    response: {
      status,
      statusText: status === 403 ? 'Forbidden' : 'Bad Request',
      headers: {},
      config: {} as any,
      data: { message, status, error: 'Auth Error' },
    },
  } as AxiosError;
}

function renderLoginPage(initialRoute = '/login') {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/customer" element={<div>Customer Dashboard Screen</div>} />
          <Route path="/admin/merchants" element={<div>Admin Merchants Screen</div>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );
}

describe('LoginPage Google OAuth & Regression Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    delete (window as any).google;
  });

  afterEach(() => {
    localStorage.clear();
    delete (window as any).google;
  });

  it('renders Google Sign-In button with proper branding and accessibility', () => {
    renderLoginPage();

    const googleBtn = screen.getByRole('button', { name: /sign in with google/i });
    expect(googleBtn).toBeInTheDocument();
    expect(screen.getByText(/or continue with/i)).toBeInTheDocument();
  });

  it('initiates Google sign-in and handles successful authentication with redirect to customer dashboard', async () => {
    vi.mocked(authService.googleLogin).mockResolvedValueOnce({
      token: 'jwt-customer-token',
      id: 'cust-123',
      email: 'customer@example.com',
      name: 'Google Customer',
      role: 'customer',
    });

    renderLoginPage();

    const googleBtn = screen.getByRole('button', { name: /sign in with google/i });
    fireEvent.click(googleBtn);

    expect(authService.googleLogin).toHaveBeenCalledWith('demo_google_token');
    expect(await screen.findByText('Customer Dashboard Screen')).toBeInTheDocument();
    expect(localStorage.getItem('swiftdrop_token')).toBe('jwt-customer-token');
  });

  it('redirects to admin dashboard when Google user has admin role', async () => {
    vi.mocked(authService.googleLogin).mockResolvedValueOnce({
      token: 'jwt-admin-token',
      id: 'admin-999',
      email: 'admin@example.com',
      name: 'Admin Google User',
      role: 'admin',
    });

    renderLoginPage();

    const googleBtn = screen.getByRole('button', { name: /sign in with google/i });
    fireEvent.click(googleBtn);

    expect(await screen.findByText('Admin Merchants Screen')).toBeInTheDocument();
    expect(localStorage.getItem('swiftdrop_token')).toBe('jwt-admin-token');
  });

  it('displays error message when Google authentication fails', async () => {
    const error = createAxiosError('Invalid or expired Google ID token', 401);
    vi.mocked(authService.googleLogin).mockRejectedValueOnce(error);

    renderLoginPage();

    const googleBtn = screen.getByRole('button', { name: /sign in with google/i });
    fireEvent.click(googleBtn);

    expect(await screen.findByText('Invalid or expired Google ID token')).toBeInTheDocument();
    expect(screen.queryByText('Customer Dashboard Screen')).not.toBeInTheDocument();
  });

  it('displays error message when account is deactivated', async () => {
    const error = createAxiosError('Your account is deactivated. Please contact support.', 403);
    vi.mocked(authService.googleLogin).mockRejectedValueOnce(error);

    renderLoginPage();

    const googleBtn = screen.getByRole('button', { name: /sign in with google/i });
    fireEvent.click(googleBtn);

    expect(await screen.findByText('Your account is deactivated. Please contact support.')).toBeInTheDocument();
  });

  it('handles user cancellation gracefully via Google prompt dismiss notification', async () => {
    let promptMomentListener: ((notification: any) => void) | undefined;

    (window as any).google = {
      accounts: {
        id: {
          initialize: vi.fn(),
          prompt: vi.fn((listener) => {
            promptMomentListener = listener;
          }),
          renderButton: vi.fn(),
        },
      },
    };

    renderLoginPage();

    const googleBtn = screen.getByRole('button', { name: /sign in with google/i });
    fireEvent.click(googleBtn);

    expect((window as any).google.accounts.id.prompt).toHaveBeenCalled();

    // Trigger user cancellation / dismissal
    if (promptMomentListener) {
      promptMomentListener({
        isNotDisplayed: () => false,
        isSkippedMoment: () => false,
        isDismissedMoment: () => true,
        getDismissedReason: () => 'credential_returned_or_closed',
      });
    }

    expect(await screen.findByText('Google Sign-In was cancelled.')).toBeInTheDocument();
  });

  it('displays loading state and disables button during Google authentication', async () => {
    let resolveLogin: (value: any) => void = () => {};
    const pendingPromise = new Promise((resolve) => {
      resolveLogin = resolve;
    });

    vi.mocked(authService.googleLogin).mockReturnValueOnce(pendingPromise as any);

    renderLoginPage();

    const googleBtn = screen.getByRole('button', { name: /sign in with google/i });
    fireEvent.click(googleBtn);

    // Button should be disabled and show loading state
    expect(googleBtn).toBeDisabled();
    expect(screen.getByText('Authenticating…')).toBeInTheDocument();

    // Resolve the promise
    resolveLogin({
      token: 'jwt-token',
      id: 'cust-1',
      email: 'cust@test.com',
      name: 'Cust',
      role: 'customer',
    });

    await waitFor(() => {
      expect(screen.getByText('Customer Dashboard Screen')).toBeInTheDocument();
    });
  });

  it('preserves existing email and password login flow as regression check', async () => {
    vi.mocked(authService.login).mockResolvedValueOnce({
      token: 'jwt-email-token',
      id: 'user-456',
      email: 'user@example.com',
      name: 'Regular User',
      role: 'customer',
    });

    renderLoginPage();

    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: 'user@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/^password/i), {
      target: { value: 'password123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /^sign in$/i }));

    expect(authService.login).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'password123',
    });

    expect(await screen.findByText('Customer Dashboard Screen')).toBeInTheDocument();
  });
});
