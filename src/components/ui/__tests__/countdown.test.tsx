import React from 'react';
import { render, fireEvent, act } from '@testing-library/react';
import Countdown from '../countdown';

jest.useFakeTimers();

describe('Countdown Component', () => {
  test('completes countdown and calls onComplete', () => {
    const onCompleteMock = jest.fn();
    render(<Countdown seconds={5} onComplete={onCompleteMock} />);

    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(onCompleteMock).toHaveBeenCalled();
  });

  test('pauses and resumes countdown', () => {
    const onCompleteMock = jest.fn();
    const { getByText } = render(<Countdown seconds={5} onComplete={onCompleteMock} />);

    fireEvent.click(getByText('Pause'));
    
    act(() => {
      jest.advanceTimersByTime(3000);
    });

    expect(getByText('2')).toBeInTheDocument();
    expect(onCompleteMock).not.toHaveBeenCalled();

    fireEvent.click(getByText('Resume'));

    act(() => {
      jest.advanceTimersByTime(3000);
    });

    expect(onCompleteMock).toHaveBeenCalled();
  });

  test('rate limits pause/resume toggles', () => {
    const onCompleteMock = jest.fn();
    const { getByText } = render(<Countdown seconds={5} onComplete={onCompleteMock} />);

    const pauseButton = getByText('Pause');

    fireEvent.click(pauseButton);
    fireEvent.click(pauseButton); // Rapid toggle

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(getByText('4')).toBeInTheDocument(); // Should have remained paused
  });
});