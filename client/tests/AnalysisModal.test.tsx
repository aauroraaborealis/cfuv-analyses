import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { useQuery } from '@tanstack/react-query';
import AnalysisModal from '../src/components/trainers/AnalysisModal';
import EditAnalysis from '../src/components/trainers/EditAnalysis';

jest.mock('@tanstack/react-query');
jest.mock('axios');
jest.mock('../src/components/trainers/EditAnalysis', () => () => (
  <div data-testid="edit-analysis">EditAnalysis</div>
));

describe('AnalysisModal', () => {
  const mockOnClose = jest.fn();
  const assignmentId = 'assign123';
  const analysisData = {
    analyze_name: 'Test Analyze',
    scheduled_date: '2025-06-20T00:00:00Z',
    sport_name: 'Football',
    assigned_to_team: true,
    team_name: 'Team X',
    student_first_name: null,
    student_last_name: null,
    trainer_first_name: 'John',
    trainer_last_name: 'Doe',
    created_at: '2025-01-01T12:34:56Z',
  };

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders nothing when assignmentId is null', () => {
    // stub useQuery so destructuring works
    (useQuery as jest.Mock).mockReturnValue({ data: null, isLoading: false, error: null });
    const { container } = render(<AnalysisModal assignmentId={null} onClose={mockOnClose} />);
    expect(container.firstChild).toBeNull();
  });

  it('shows loading state', () => {
    (useQuery as jest.Mock).mockReturnValue({ data: null, isLoading: true, error: null });
    render(<AnalysisModal assignmentId={assignmentId} onClose={mockOnClose} />);
    expect(screen.getByText(/Загрузка\.\.\./)).toBeInTheDocument();
  });

  it('shows error state', () => {
    (useQuery as jest.Mock).mockReturnValue({ data: null, isLoading: false, error: new Error('fail') });
    render(<AnalysisModal assignmentId={assignmentId} onClose={mockOnClose} />);
    expect(screen.getByText(/Ошибка загрузки данных/)).toBeInTheDocument();
  });

  it('displays analysis details and close button works', () => {
    (useQuery as jest.Mock).mockReturnValue({ data: analysisData, isLoading: false, error: null });
    render(<AnalysisModal assignmentId={assignmentId} onClose={mockOnClose} />);

    expect(screen.getByRole('heading', { name: /Подробная информация/ })).toBeInTheDocument();
    expect(screen.getByText('Test Analyze')).toBeInTheDocument();
    expect(screen.getByText('Football')).toBeInTheDocument();
    expect(screen.getByText('Команде')).toBeInTheDocument();
    expect(screen.getByText('Team X')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Закрыть/ }));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('switches to edit mode when Edit button clicked', () => {
    (useQuery as jest.Mock).mockReturnValue({ data: analysisData, isLoading: false, error: null });
    render(<AnalysisModal assignmentId={assignmentId} onClose={mockOnClose} />);

    fireEvent.click(screen.getByRole('button', { name: /Редактировать/ }));
    expect(screen.getByTestId('edit-analysis')).toBeInTheDocument();
  });
});
