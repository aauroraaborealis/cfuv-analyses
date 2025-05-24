// tests/RecordsPerPageSelect.test.tsx
import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import RecordsPerPageSelect from '../src/components/shared/RecordsPerPageSelect';

// Мокаем react-select как обычный <select> для упрощения тестирования
jest.mock('react-select', () => (props: any) => (
  <select
    data-testid="records-per-page-select"
    value={props.value?.value}
    onChange={(e) => {
      const val = Number(e.target.value);
      const option = props.options.find((opt: any) => opt.value === val);
      props.onChange(option);
    }}
  >
    {props.options.map((opt: any) => (
      <option key={opt.value} value={opt.value}>
        {opt.label}
      </option>
    ))}
  </select>
));

describe('RecordsPerPageSelect component', () => {
  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });

  it('renders label and select with correct initial value', () => {
    const handleChange = jest.fn();
    render(<RecordsPerPageSelect value={20} onChange={handleChange} />);

    // Проверяем текст метки
    expect(screen.getByText('Показывать на странице:')).toBeInTheDocument();

    // Проверяем, что селект отображает переданное значение
    const select = screen.getByTestId('records-per-page-select') as HTMLSelectElement;
    expect(select.value).toBe('20');
  });

  it('calls onChange with the selected number when a new option is chosen', () => {
    const handleChange = jest.fn();
    render(<RecordsPerPageSelect value={10} onChange={handleChange} />);

    const select = screen.getByTestId('records-per-page-select') as HTMLSelectElement;
    // Меняем значение на 50
    fireEvent.change(select, { target: { value: '50' } });

    // Проверяем, что onChange вызван с числом 50
    expect(handleChange).toHaveBeenCalledWith(50);
  });

  it('renders all provided options', () => {
    const handleChange = jest.fn();
    render(<RecordsPerPageSelect value={10} onChange={handleChange} />);

    const options = screen.getAllByRole('option');
    const labels = options.map((opt) => opt.textContent);
    expect(labels).toEqual(['10', '20', '50', '100']);
  });
});
