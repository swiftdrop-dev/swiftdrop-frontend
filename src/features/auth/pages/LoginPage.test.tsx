import { render, screen, fireEvent } from '@testing-library/react';
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

  it('does not create a session when Google Sign-In is not configured', async () => {
    renderLoginPage();

    fireEvent.click(screen.getByRole('button', { name: /sign in with google/i }));

    expect(await screen.findByText('Google Sign-In is not configured.')).toBeInTheDocument();
    expect(authService.googleLogin).not.toHaveBeenCalled();
    expect(localStorage.getItem('swiftdrop_token')).toBeNull();
  });

  it('displays error message when Google authentication is unavailable', async () => {
    renderLoginPage();

    fireEvent.click(screen.getByRole('button', { name: /sign in with google/i }));

    expect(await screen.findByText('Google Sign-In is not configured.')).toBeInTheDocument();
    expect(screen.queryByText('Customer Dashboard Screen')).not.toBeInTheDocument();
  });

  it('displays error message when account is deactivated', async () => {
    const error = createAxiosError('Your account is deactivated. Please contact support.', 403);
    vi.mocked(authService.login).mockRejectedValueOnce(error);

    renderLoginPage();

    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'customer@example.com' } });
    fireEvent.change(screen.getByLabelText(/^password/i), { target: { value: 'secret-pass' } });
    fireEvent.click(screen.getByRole('button', { name: /^sign in$/i }));

    expect(await screen.findByText('Your account is deactivated. Please contact support.')).toBeInTheDocument();
    expect(localStorage.getItem('swiftdrop_token')).toBeNull();
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

  it('does not start a Google session when Sign-In is not configured', async () => {
    renderLoginPage();

    const googleBtn = screen.getByRole('button', { name: /sign in with google/i });
    fireEvent.click(googleBtn);

    expect(googleBtn).not.toBeDisabled();
    expect(screen.queryByText('Authenticating…')).not.toBeInTheDocument();
    expect(await screen.findByText('Google Sign-In is not configured.')).toBeInTheDocument();
    expect(authService.googleLogin).not.toHaveBeenCalled();
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
