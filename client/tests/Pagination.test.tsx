import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import Pagination from '../src/components/shared/Pagination';

describe('Pagination component', () => {
  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });

  it('renders current page and total pages', () => {
    render(
      <Pagination
        currentPage={2}
        totalPages={5}
        onPageChange={jest.fn()}
      />
    );
    expect(screen.getByText('Страница 2 из 5')).toBeInTheDocument();
  });

  it('disables Previous button on first page', () => {
    const onPageChange = jest.fn();
    render(
      <Pagination currentPage={1} totalPages={3} onPageChange={onPageChange} />
    );
    const prevBtn = screen.getByText('◄') as HTMLButtonElement;
    expect(prevBtn.disabled).toBe(true);
    fireEvent.click(prevBtn);
    expect(onPageChange).not.toHaveBeenCalled();
  });

  it('disables Next button on last page', () => {
    const onPageChange = jest.fn();
    render(
      <Pagination currentPage={4} totalPages={4} onPageChange={onPageChange} />
    );
    const nextBtn = screen.getByText('►') as HTMLButtonElement;
    expect(nextBtn.disabled).toBe(true);
    fireEvent.click(nextBtn);
    expect(onPageChange).not.toHaveBeenCalled();
  });

  it('calls onPageChange with currentPage - 1 when Previous clicked', () => {
    const onPageChange = jest.fn();
    render(
      <Pagination currentPage={3} totalPages={5} onPageChange={onPageChange} />
    );
    const prevBtn = screen.getByText('◄');
    fireEvent.click(prevBtn);
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('calls onPageChange with currentPage + 1 when Next clicked', () => {
    const onPageChange = jest.fn();
    render(
      <Pagination currentPage={3} totalPages={5} onPageChange={onPageChange} />
    );
    const nextBtn = screen.getByText('►');
    fireEvent.click(nextBtn);
    expect(onPageChange).toHaveBeenCalledWith(4);
  });
});
