// tests/SuccessModal.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SuccessModal from '../src/components/shared/SuccessModal';

describe('SuccessModal', () => {
  it('renders the message and close button', () => {
    render(<SuccessModal message="Test message" />);
    // The message should be visible
    expect(screen.getByText('Test message')).toBeInTheDocument();
    // The close button (an <img> inside a button) should be present
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByAltText('Закрыть')).toBeInTheDocument();
  });

  it('hides the modal when close button is clicked', () => {
    render(<SuccessModal message="Another message" />);
    // Click the close button
    fireEvent.click(screen.getByRole('button'));
    // After clicking, the message should no longer be in the document
    expect(screen.queryByText('Another message')).toBeNull();
  });

  it('calls onClose callback when provided upon closing', () => {
    const onCloseMock = jest.fn();
    render(<SuccessModal message="Callback test" onClose={onCloseMock} />);
    fireEvent.click(screen.getByRole('button'));
    // onClose should have been called exactly once
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it('does not error if onClose is not provided', () => {
    render(<SuccessModal message="No callback" />);
    // Simply ensure clicking still hides modal without throwing
    expect(() => {
      fireEvent.click(screen.getByRole('button'));
    }).not.toThrow();
  });
});
