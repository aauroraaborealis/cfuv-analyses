// tests/SubmitAnalysis.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import axios from 'axios';
import { useMutation } from '@tanstack/react-query';
import SubmitAnalysis from '../src/components/students/SubmitAnalysis';
import analyzeFields from '../src/utils/analyzeFields';

jest.mock('axios');

// Мокаем useMutation для контроля состояния
jest.mock('@tanstack/react-query', () => ({
  useMutation: jest.fn(),
}));

// Мокаем SuccessModal
jest.mock('../src/components/shared/SuccessModal', () => ({ message, onClose }: any) => (
  <div data-testid="success-modal">
    <span>{message}</span>
    <button onClick={onClose}>Close</button>
  </div>
));

describe('SubmitAnalysis component', () => {
  const fields = [{ label: 'Field1', type: 'string' }];
  const originalFields = analyzeFields['testAnalysis'];
  beforeAll(() => {
    // временно добавим тестовый анализ
    analyzeFields['testAnalysis'] = fields;
  });
  afterAll(() => {
    analyzeFields['testAnalysis'] = originalFields;
  });

  let mockMutate: any;
  let mockStatus: any;

  beforeEach(() => {
    cleanup();
    mockMutate = jest.fn();
    mockStatus = { isPending: false };
    (useMutation as jest.Mock).mockReturnValue({
      mutate: mockMutate,
      isPending: mockStatus.isPending,
    });
    localStorage.setItem('token', 'abc');
  });

  it('renders form fields from analyzeFields and submits', () => {
    render(
      <MemoryRouter initialEntries={[{ pathname: '/submit/testAnalysis', state: { analyze_name: 'testAnalysis' } }]}>
        <Routes>
          <Route path="/submit/:assignment_id" element={<SubmitAnalysis />} />
        </Routes>
      </MemoryRouter>
    );

    // поле должен отобразиться
    const input = screen.getByLabelText('Field1:');
    expect(input).toBeInTheDocument();

    // ввод данных
    fireEvent.change(input, { target: { value: 'value1' } });
    // клик по кнопке
    const submitBtn = screen.getByRole('button', { name: /Отправить/i });
    fireEvent.click(submitBtn);
    expect(mockMutate).toHaveBeenCalled();
  });

  it('shows error message on mutation error', async () => {
    const errorMessage = 'Ошибка сервера';
    // замокаем onError
    (useMutation as jest.Mock).mockImplementationOnce(({ onError }: any) => {
      // вызвать сразу ошибку
      onError({ response: { data: { message: errorMessage } } });
      return { mutate: jest.fn(), isPending: false };
    });

    render(
      <MemoryRouter initialEntries={[{ pathname: '/submit/testAnalysis', state: { analyze_name: 'testAnalysis' } }]}>
        <Routes>
          <Route path="/submit/:assignment_id" element={<SubmitAnalysis />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('displays success modal and navigates after close', async () => {
    jest.useFakeTimers();
    // замокаем onSuccess
    (useMutation as jest.Mock).mockImplementationOnce(({ onSuccess }: any) => {
      onSuccess();
      return { mutate: jest.fn(), isPending: false };
    });
    const { container } = render(
      <MemoryRouter initialEntries={[{ pathname: '/submit/testAnalysis', state: { analyze_name: 'testAnalysis' } }]}>
        <Routes>
          <Route path="/submit/:assignment_id" element={<SubmitAnalysis />} />
        </Routes>
      </MemoryRouter>
    );

    // модалка должна появиться
    expect(screen.getByTestId('success-modal')).toBeInTheDocument();
    // симулируем клик закрытия
    fireEvent.click(screen.getByText('Close'));

    // переключаем таймеры
    jest.runAllTimers();
    // проверяем, что модалка скрылась
    expect(screen.queryByTestId('success-modal')).toBeNull();
    jest.useRealTimers();
  });
});
