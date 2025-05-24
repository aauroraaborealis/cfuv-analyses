// tests/SearchBar.test.tsx
import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import SearchBar from '../src/components/shared/SearchBar';

describe('SearchBar component', () => {
  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });

  it('renders label, input with value and default placeholder', () => {
    const handleChange = jest.fn();
    render(
      <SearchBar value="test" onChange={handleChange} />
    );

    // Проверяем наличие метки
    expect(screen.getByText('Поиск:')).toBeInTheDocument();

    // Проверяем input
    const input = screen.getByPlaceholderText('Введите запрос') as HTMLInputElement;
    expect(input).toBeInTheDocument();
    expect(input.value).toBe('test');
  });

  it('uses custom placeholder when provided', () => {
    const handleChange = jest.fn();
    render(
      <SearchBar value="" onChange={handleChange} placeholder="Custom" />
    );

    const input = screen.getByPlaceholderText('Custom');
    expect(input).toBeInTheDocument();
  });

  it('calls onChange with new value when typing', () => {
    const handleChange = jest.fn();
    render(
      <SearchBar value="" onChange={handleChange} />
    );

    const input = screen.getByPlaceholderText('Введите запрос') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'hello' } });

    expect(handleChange).toHaveBeenCalledWith('hello');
  });
});
