// src/App.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../src/App'; // Adjust the path as needed

// Мокаем Header и AppRoutes, чтобы тест был изолированным
jest.mock('../src/components/Header', () => () => <div data-testid="header">HeaderMock</div>);
jest.mock('../src/components/AppRoutes', () => () => <div data-testid="routes">RoutesMock</div>);

describe('App component', () => {
  it('renders Header and AppRoutes inside a Router', () => {
    render(<App />);

    // Проверяем, что наши заглушки отрисовались
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('routes')).toBeInTheDocument();
  });

  it('matches snapshot', () => {
    const { asFragment } = render(<App />);
    expect(asFragment()).toMatchSnapshot();
  });
});
