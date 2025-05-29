// __tests__/Register.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Register from '../src/components/Register';
import { isAuthenticated, getRoleFromToken } from '../src/utils/auth';
import { useNavigate } from 'react-router-dom';

// Моки для дочерних компонентов
jest.mock('../src/components/RegisterStudent', () => () => <div>RegisterStudent Component</div>);
jest.mock('../src/components/RegisterTrainer', () => () => <div>RegisterTrainer Component</div>);

// Моки для auth и роутинга
jest.mock('../src/utils/auth');
const mockIsAuth = isAuthenticated as jest.Mock;
const mockGetRole = getRoleFromToken as jest.Mock;

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

describe('Register', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('redirects to /my-analysis if authenticated as student', () => {
    mockIsAuth.mockReturnValue(true);
    mockGetRole.mockReturnValue('student');
    render(<Register />);
    expect(mockNavigate).toHaveBeenCalledWith('/my-analysis');
  });

  it('redirects to /analysis-results if authenticated as trainer', () => {
    mockIsAuth.mockReturnValue(true);
    mockGetRole.mockReturnValue('trainer');
    render(<Register />);
    expect(mockNavigate).toHaveBeenCalledWith('/analysis-results');
  });

  it('does not redirect if not authenticated', () => {
    mockIsAuth.mockReturnValue(false);
    render(<Register />);
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(screen.getByRole('heading', { name: /Регистрация/i })).toBeInTheDocument();
  });

  it('renders RegisterStudent when "Я спортсмен" selected', () => {
    mockIsAuth.mockReturnValue(false);
    render(<Register />);
    const studentRadio = screen.getByLabelText(/Я спортсмен/i) as HTMLInputElement;
    fireEvent.click(studentRadio);
    expect(studentRadio.checked).toBe(true);
    expect(screen.getByText('RegisterStudent Component')).toBeInTheDocument();
    expect(screen.queryByText('RegisterTrainer Component')).toBeNull();
  });

  it('renders RegisterTrainer when "Я медицинский работник" selected', () => {
    mockIsAuth.mockReturnValue(false);
    render(<Register />);
    const trainerRadio = screen.getByLabelText(/Я медицинский работник/i) as HTMLInputElement;
    fireEvent.click(trainerRadio);
    expect(trainerRadio.checked).toBe(true);
    expect(screen.getByText('RegisterTrainer Component')).toBeInTheDocument();
    expect(screen.queryByText('RegisterStudent Component')).toBeNull();
  });
});
