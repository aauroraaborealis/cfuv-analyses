// tests/AnalysisModal.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import axios from 'axios';

// 1) Мокаем useQuery до импорта самого модуля
jest.mock('@tanstack/react-query', () => ({ useQuery: jest.fn() }));
import { useQuery } from '@tanstack/react-query';

// 2) Мокаем дочерний компонент EditAnalysis
jest.mock('../src/components/trainers/EditAnalysis', () => () => (
  <div data-testid="edit-analysis">
    <button className="close-edit-btn">Close Edit</button>
  </div>
));

// 3) Теперь — импорт того, что тестируем
import AnalysisModal from '../src/components/trainers/AnalysisModal';

jest.mock('axios');

describe('AnalysisModal component', () => {
  const mockAnalysis = {
    analyze_name: 'Test Analysis',
    scheduled_date: '2025-05-20T12:00:00Z',
    sport_name: 'Football',
    assigned_to_team: false,
    student_first_name: 'John',
    student_last_name: 'Doe',
    trainer_first_name: 'Jane',
    trainer_last_name: 'Smith',
    created_at: '2025-05-15T08:30:00Z',
    team_name: null,
  };

  beforeEach(() => {
    cleanup();
    jest.resetAllMocks();
    // Дефолтно возвращаем «ничего»
    (useQuery as jest.Mock).mockReturnValue({ data: undefined, isLoading: false, error: null });
  });

  it('does not render when assignmentId is null', () => {
    const { container } = render(<AnalysisModal assignmentId={null} onClose={jest.fn()} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders loading state', () => {
    (useQuery as jest.Mock).mockReturnValueOnce({ data: undefined, isLoading: true, error: null });
    render(<AnalysisModal assignmentId="1" onClose={jest.fn()} />);
    expect(screen.getByText('Загрузка...')).toBeInTheDocument();
  });

  it('renders details and calls onClose', async () => {
    (useQuery as jest.Mock).mockReturnValueOnce({ data: mockAnalysis, isLoading: false, error: null });
    (axios.get as jest.Mock).mockResolvedValue({ data: mockAnalysis });

    const onClose = jest.fn();
    render(<AnalysisModal assignmentId="1" onClose={onClose} />);

    // Ждём пока данные отрисуются
    await waitFor(() => expect(screen.getByText('Test Analysis')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /Закрыть/i }));
    expect(onClose).toHaveBeenCalled();
  });

  it('toggles to edit mode and back', async () => {
    (useQuery as jest.Mock).mockReturnValueOnce({ data: mockAnalysis, isLoading: false, error: null });
    (axios.get as jest.Mock).mockResolvedValue({ data: mockAnalysis });

    render(<AnalysisModal assignmentId="1" onClose={jest.fn()} />);

    await waitFor(() => expect(screen.getByText('Test Analysis')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: 'Редактировать' }));
    expect(screen.getByTestId('edit-analysis')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Close Edit'));
    // После закрытия — снова видим детали
    await waitFor(() => expect(screen.getByText('Test Analysis')).toBeInTheDocument());
  });
});
