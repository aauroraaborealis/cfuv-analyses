// tests/VerifyCode.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import axios from 'axios';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { toast } from 'react-toastify';

// Mocks
jest.mock('axios');
jest.mock('react-toastify', () => ({ toast: { success: jest.fn(), error: jest.fn() } }));
jest.mock('../src/components/AuthProvider', () => ({ useAuth: () => ({ setAccessToken: jest.fn() }) }));

// Mock navigate before importing component
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

import VerifyCode from '../src/components/VerifyCode';

describe('VerifyCode component', () => {
  const mockPost = axios.post as jest.Mock;

  beforeEach(() => {
    cleanup();
    mockPost.mockReset();
    (toast.success as jest.Mock).mockClear();
    (toast.error as jest.Mock).mockClear();
    mockNavigate.mockClear();
    localStorage.clear();
  });

  function setup(state: any) {
    render(
      <MemoryRouter initialEntries={[{ pathname: '/verify', state }] }>
        <Routes>
          <Route path="/verify" element={<VerifyCode />} />
        </Routes>
      </MemoryRouter>
    );
  }

  it('verifies code successfully and navigates for student', async () => {
    const fakeToken = 'tok123';
    mockPost.mockResolvedValueOnce({ data: { token: fakeToken } });

    setup({ email: 'a@b.c', role: 'student' });
    fireEvent.change(screen.getByPlaceholderText(/Введите код/), { target: { value: '1234' } });
    fireEvent.click(screen.getByText('Подтвердить'));

    await waitFor(() => expect(mockPost).toHaveBeenCalledWith(
      expect.stringContaining('/register/verify'),
      { email: 'a@b.c', code: '1234', role: 'student' },
      { withCredentials: true }
    ));
    expect(localStorage.getItem('token')).toBe(fakeToken);
    expect(toast.success).toHaveBeenCalledWith('Регистрация завершена!');
    expect(mockNavigate).toHaveBeenCalledWith('/my-analysis');
  });

  it('verifies code successfully and navigates for trainer', async () => {
    mockPost.mockResolvedValueOnce({ data: { token: 'T' } });

    setup({ email: 't@b.c', role: 'trainer' });
    fireEvent.change(screen.getByPlaceholderText(/Введите код/), { target: { value: '0000' } });
    fireEvent.click(screen.getByText('Подтвердить'));

    await waitFor(() => expect(toast.success).toHaveBeenCalled());
    expect(mockNavigate).toHaveBeenCalledWith('/analysis-results');
  });

  it('shows error toast on failure', async () => {
    mockPost.mockRejectedValueOnce({ response: { data: { message: 'bad' } } });

    setup({ email: 'e@c', role: 'student' });
    fireEvent.click(screen.getByText('Подтвердить'));

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('bad'));
    expect(localStorage.getItem('token')).toBeNull();
  });
});
