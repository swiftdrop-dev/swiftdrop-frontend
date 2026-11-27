import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import RegisterPage from './RegisterPage';
import { AuthProvider } from '../context/AuthContext';
import { authService } from '../../../services/auth.service';

vi.mock('../../../services/auth.service', () => ({
  authService: {
    login: vi.fn(),
    register: vi.fn(),
    googleLogin: vi.fn(),
    logout: vi.fn(),
    getToken: vi.fn(),
  },
}));

function renderRegisterPage(initialRoute = '/register') {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <AuthProvider>
        <Routes>
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/customer" element={<div>Customer Dashboard Screen</div>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );
}

describe('RegisterPage Google OAuth & Regression Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('renders Google Sign-Up button and divider', () => {
    renderRegisterPage();

    const googleBtn = screen.getByRole('button', { name: /sign up with google/i });
    expect(googleBtn).toBeInTheDocument();
    expect(screen.getByText(/or continue with/i)).toBeInTheDocument();
  });

  it('does not create a session when Google sign-up is not configured', async () => {
    renderRegisterPage();

    fireEvent.click(screen.getByRole('button', { name: /sign up with google/i }));

    expect(await screen.findByText('Google Sign-In is not configured.')).toBeInTheDocument();
    expect(authService.googleLogin).not.toHaveBeenCalled();
    expect(localStorage.getItem('swiftdrop_token')).toBeNull();
  });

  it('displays error message when Google sign-up is unavailable', async () => {
    renderRegisterPage();

    fireEvent.click(screen.getByRole('button', { name: /sign up with google/i }));

    expect(await screen.findByText('Google Sign-In is not configured.')).toBeInTheDocument();
    expect(screen.queryByText('Customer Dashboard Screen')).not.toBeInTheDocument();
  });

  it('preserves existing registration form submission flow as regression check', async () => {
    vi.mocked(authService.register).mockResolvedValueOnce({
      token: 'jwt-register-token',
      id: 'cust-standard',
      email: 'standard@example.com',
      name: 'Standard User',
      role: 'customer',
    });

    renderRegisterPage();

    fireEvent.change(screen.getByLabelText(/full name/i), {
      target: { value: 'Standard User' },
    });
    fireEvent.change(screen.getByLabelText(/^email/i), {
      target: { value: 'standard@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/phone/i), {
      target: { value: '077-1234567' },
    });
    fireEvent.change(screen.getByLabelText(/^password/i), {
      target: { value: 'securepassword123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    expect(authService.register).toHaveBeenCalledWith({
      name: 'Standard User',
      email: 'standard@example.com',
      phone: '077-1234567',
      password: 'securepassword123',
    });

    expect(await screen.findByText('Customer Dashboard Screen')).toBeInTheDocument();
  });
});
