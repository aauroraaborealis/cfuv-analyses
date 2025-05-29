
// tests/AuthProvider.test.tsx
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import axios from 'axios';
import { AuthProvider, useAuth } from '../src/components/AuthProvider';

// Mock axios
jest.mock('axios');
const mockPost = axios.post as jest.Mock;

// Test component that consumes context
function TestConsumer() {
  const { accessToken, isInitialized } = useAuth();
  return (
    <div>
      <span data-testid="token">{accessToken ?? 'null'}</span>
      <span data-testid="init">{isInitialized.toString()}</span>
    </div>
  );
}

describe('AuthProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset window location
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { pathname: '/home' },
    });
  });

  it('skips refresh on public path', async () => {
    window.location.pathname = '/login';
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );
    expect(screen.getByTestId('init')).toHaveTextContent('true');
    expect(screen.getByTestId('token')).toHaveTextContent('null');
    expect(mockPost).not.toHaveBeenCalled();
  });

  it('fetches token on non-public path', async () => {
    mockPost.mockResolvedValueOnce({ data: { accessToken: 'abc' } });
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );
    await waitFor(() => expect(mockPost).toHaveBeenCalledWith(
      expect.stringContaining('/refresh'),
      {},
      { withCredentials: true }
    ));
    // After fetch
    await waitFor(() => expect(screen.getByTestId('init')).toHaveTextContent('true'));
    expect(screen.getByTestId('token')).toHaveTextContent('abc');
  });

  it('handles refresh failure', async () => {
    mockPost.mockRejectedValueOnce(new Error('fail'));
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );
    await waitFor(() => expect(mockPost).toHaveBeenCalled());
    await waitFor(() => {
      expect(screen.getByTestId('token')).toHaveTextContent('null');
      expect(screen.getByTestId('init')).toHaveTextContent('true');
    });
  });
});
