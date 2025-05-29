// __tests__/ProfileForm.test.tsx
import React from 'react';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import ProfileForm from '../src/components/ProfileForm';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { fetchTeams } from '../src/utils/fetch';
import { useAuth } from '../src/components/AuthProvider';
import 'react-toastify/dist/ReactToastify.css';

jest.mock('axios');
jest.mock('@tanstack/react-query');
jest.mock('../src/utils/fetch');
jest.mock('../src/components/AuthProvider');
jest.mock('../src/components/shared/SuccessModal', () => ({
  __esModule: true,
  default: ({ message, onClose }: any) => (
    <div role="dialog">
      <p>{message}</p>
      <button onClick={onClose}>Close</button>
    </div>
  )
}));

describe('ProfileForm', () => {
  const user = {
    email: 'test@example.com',
    first_name: 'Ivan',
    middle_name: 'Petrovich',
    last_name: 'Ivanov',
    birth_date: '01.02.1990',
    gender: 'M',
    sport_id: 1,
    sport_name: 'Football',
    team_id: 2,
    team_name: 'Team A'
  };

  beforeEach(() => {
    jest.resetAllMocks();
    Storage.prototype.getItem = jest.fn().mockReturnValue('fake-token');
    (useAuth as jest.Mock).mockReturnValue({ accessToken: 'fake-token' });
    (axios.get as jest.Mock).mockResolvedValue({ data: { user } });
    (useQuery as jest.Mock).mockImplementation(({ queryKey }) => {
      if (queryKey[0] === 'sports') return { data: [], isLoading: false, refetch: jest.fn() };
      if (queryKey[0] === 'teams')  return { data: [], isFetching: false, refetch: jest.fn() };
      return {};
    });
    (fetchTeams as jest.Mock).mockResolvedValue([]);
  });

  it('loads and displays profile, toggles edit, submits, shows modal', async () => {
    (axios.put as jest.Mock).mockResolvedValue({ data: {} });
    jest.useFakeTimers();

    render(<ProfileForm />);

    // loading...
    expect(screen.getByText(/Загрузка профиля/i)).toBeInTheDocument();

    // view mode shows these spans
    expect(await screen.findByText(user.email)).toBeInTheDocument();
    expect(screen.getByText(user.last_name)).toBeInTheDocument();
    expect(screen.getByText('01.02.1990')).toBeInTheDocument();
    expect(screen.getByText(user.sport_name)).toBeInTheDocument();
    expect(screen.getByText(user.team_name)).toBeInTheDocument();

    // enter edit mode
    fireEvent.click(screen.getByRole('button', { name: /Редактировать/i }));

    // editing: email input prefilled
    const emailInput = screen.getByDisplayValue(user.email);
    expect(emailInput).toBeInTheDocument();

    // editing: date input shows ISO
    const dateInput = screen.getByDisplayValue('1990-02-01');
    expect((dateInput as HTMLInputElement).value).toBe('1990-02-01');

    // change first name & date
    const nameInput = screen.getByDisplayValue(user.first_name);
    fireEvent.change(nameInput, { target: { value: 'Sergey' } });
    expect((nameInput as HTMLInputElement).value).toBe('Sergey');
    fireEvent.change(dateInput, { target: { value: '1991-03-04' } });
    expect((dateInput as HTMLInputElement).value).toBe('1991-03-04');

    // submit
    fireEvent.click(screen.getByRole('button', { name: /Сохранить/i }));

    // PUT called correctly
    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith(
        expect.stringContaining('/user/profile'),
        expect.objectContaining({
          email: user.email,
          first_name: 'Sergey',
          birth_date: '1991-03-04'
        }),
        expect.objectContaining({ headers: { Authorization: 'Bearer fake-token' } })
      );
    });

    // success modal
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/Профиль обновлён!/i)).toBeInTheDocument();

    act(() => jest.advanceTimersByTime(3000));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    jest.useRealTimers();
  });

  it('shows error toast on PUT failure', async () => {
    (axios.put as jest.Mock).mockRejectedValue({ response: { data: { message: 'Error!' } } });

    render(<ProfileForm />);
    expect(await screen.findByText(user.email)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Редактировать/i }));
    fireEvent.click(screen.getByRole('button', { name: /Сохранить/i }));
    expect(await screen.findByText(/Error!/i)).toBeInTheDocument();
  });
});