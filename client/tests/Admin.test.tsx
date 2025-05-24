import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Admin from '../src/components/trainers/Admin';

describe('Admin component', () => {
  it('renders links to assign and results pages', () => {
    render(
      <MemoryRouter>
        <Admin />
      </MemoryRouter>
    );
    const assignLink = screen.getByRole('link', { name: 'Назначение анализа' });
    const resultsLink = screen.getByRole('link', { name: 'Результаты анализов' });

    expect(assignLink).toBeInTheDocument();
    expect(assignLink).toHaveAttribute('href', '/assign-analysis');

    expect(resultsLink).toBeInTheDocument();
    expect(resultsLink).toHaveAttribute('href', '/analysis-results');
  });
});
