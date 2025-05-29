import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import UserDashboard from '../src/components/students/UserDashboard';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { fetchAnalyzes } from '../src/utils/fetch';
import * as api from '../src/utils/api';
// Моки

beforeAll(() => {
  // @ts-ignore
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

jest.mock('@tanstack/react-query');
jest.mock('axios');
jest.mock('../src/utils/fetch');
jest.mock('../src/utils/api');


describe('UserDashboard', () => {
  const mockAnalyses = [
    { value: '1', label: 'Analysis 1' },
    { value: '2', label: 'Analysis 2' }
  ];
  const mockResults = {
    results: [
      {
        parameter: 'param1',
        lowerBound: 10,
        upperBound: 20,
        measurements: [
          { value: '12', date: '2025-05-28T10:00:00Z' },
          { value: '15', date: '2025-05-28T11:00:00Z' }
        ]
      },
      {
        parameter: 'param2',
        lowerBound: null,
        upperBound: 30,
        measurements: [
          { value: '25', date: '2025-05-28T10:00:00Z' }
        ]
      }
    ]
  };

  beforeEach(() => {
    jest.resetAllMocks();
    (fetchAnalyzes as jest.Mock).mockResolvedValue(mockAnalyses);
    (api as any).SERVER_LINK = 'https://test';
    Storage.prototype.getItem = jest.fn().mockReturnValue('fake-token');
  });

  function mockUseQuery(
    analysesData: any,
    resultsData: any,
    loadingAnalyses = false,
    loadingResults = false,
    error: any = null
  ) {
    (useQuery as jest.Mock).mockImplementation(({ queryKey }) => {
      if (queryKey[0] === 'userAnalyses') {
        return { data: analysesData, isLoading: loadingAnalyses };
      }
      if (queryKey[0] === 'userResults') {
        return { data: resultsData, isLoading: loadingResults, error };
      }
      return {};
    });
  }

  it('показывает заглушку загрузки анализов', () => {
    mockUseQuery([], null, true);
    render(<UserDashboard />);
    expect(screen.getByText(/Загрузка.../i)).toBeInTheDocument();
  });

  it('показывает сообщение об отсутствии данных для графика', async () => {
    mockUseQuery(mockAnalyses, { results: [] }, false, false, null);
    render(<UserDashboard />);

    // находим input-элемент react-select
    const combobox = screen.getByRole('combobox');
    fireEvent.keyDown(combobox, { key: 'ArrowDown', code: 'ArrowDown' });

    await waitFor(() => screen.getByText('Analysis 1'));
    fireEvent.click(screen.getByText('Analysis 1'));

    await waitFor(() => {
      expect(screen.getByText(/Недостаточно данных для графика/i)).toBeInTheDocument();
    });
  });

  it('отображает чекбоксы и график при наличии данных', async () => {
    mockUseQuery(mockAnalyses, mockResults, false, false, null);
    render(<UserDashboard />);

    const combobox = screen.getByRole('combobox');
    fireEvent.keyDown(combobox, { key: 'ArrowDown', code: 'ArrowDown' });

    await waitFor(() => screen.getByText('Analysis 1'));
    fireEvent.click(screen.getByText('Analysis 1'));

    await waitFor(() => {
      expect(screen.getByLabelText('param1')).toBeInTheDocument();
      expect(screen.getByLabelText('param2')).toBeInTheDocument();
    });

    const cb1 = screen.getByLabelText('param1') as HTMLInputElement;
    expect(cb1.checked).toBe(true);

    fireEvent.click(cb1);
    expect(cb1.checked).toBe(false);

    expect(screen.getByText(/Динамика показателей/i)).toBeInTheDocument();
    // проверяем, что график отрисован (Recharts рендерит <svg>)
    expect(document.querySelector('svg')).toBeInTheDocument();
  });

  it('обрабатывает ошибку при отсутствии токена', async () => {
    Storage.prototype.getItem = jest.fn().mockReturnValue(null);
    (axios.get as jest.Mock).mockRejectedValue(new Error('Ошибка: Токен не найден'));
    mockUseQuery(mockAnalyses, null, false, false, null);
    render(<UserDashboard />);

    const combobox = screen.getByRole('combobox');
    fireEvent.keyDown(combobox, { key: 'ArrowDown', code: 'ArrowDown' });

    await waitFor(() => screen.getByText('Analysis 1'));
    fireEvent.click(screen.getByText('Analysis 1'));

    await waitFor(() => {
      expect(screen.getByText(/Недостаточно данных для графика/i)).toBeInTheDocument();
    });
  });
});
