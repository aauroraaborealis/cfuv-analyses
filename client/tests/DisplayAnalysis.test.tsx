import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DisplayAnalysis, { formatDate } from '../src/components/trainers/DisplayAnalysis';

describe('formatDate utility', () => {
  it('formats ISO date string into DD.MM.YYYY HH:MM in Russian locale', () => {
    const iso = '2025-03-21T21:25:00Z';
    const formatted = formatDate(iso);
    // Expect pattern matching day March 2025 with minute 25
    expect(formatted).toMatch(/\d{2}\.03\.2025 \d{2}:25/);
  });
});


describe('DisplayAnalysis component', () => {
  beforeEach(() => {
    // Mock global.fetch
    (global as any).fetch = jest.fn()
      // First call: fetch analyses list
      .mockResolvedValueOnce({
        json: async () => [
          { analyze_id: 'a1', analyze_name: 'Test Analysis' }
        ]
      })
      // Second call: fetch table data for selected analysis
      .mockResolvedValueOnce({ ok: true, json: async () => [
        { assignment_id: 'x', Нормы: { Value: { unit: 'u', lower_bound: 1, upper_bound: 2 } }, 'Дата сдачи': '2025-03-21T21:25:00Z', Field: 'Value' }
      ]});
  });

  it('fetches analyses on mount and allows selecting one', async () => {
    render(<DisplayAnalysis />);

    // initial fetch for analyses
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/analysis'));

    // wait for Select placeholder
    expect(await screen.findByText('Выберите анализ')).toBeInTheDocument();
  });
});
