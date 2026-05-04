import { cleanup, render, screen, act } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { LabTimer } from '../lab-timer';

describe('LabTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    localStorage.clear();
  });

  it('renders timer display', () => {
    render(<LabTimer durationMinutes={5} />);
    expect(screen.getByTestId('lab-timer')).toBeInTheDocument();
  });

  it('displays initial time in MM:SS format', () => {
    render(<LabTimer durationMinutes={5} />);
    expect(screen.getByTestId('lab-timer-display')).toHaveTextContent('05:00');
  });

  it('has timer role for accessibility', () => {
    render(<LabTimer durationMinutes={5} />);
    expect(screen.getByRole('timer')).toBeInTheDocument();
  });

  it('updates display as time passes', async () => {
    render(<LabTimer durationMinutes={5} />);

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(screen.getByTestId('lab-timer-display')).toHaveTextContent('04:57');
  });

  it('calls onTimeUp when timer expires', async () => {
    const onTimeUp = vi.fn();
    render(<LabTimer durationMinutes={1} onTimeUp={onTimeUp} />);

    act(() => {
      vi.advanceTimersByTime(60 * 1000);
    });

    expect(onTimeUp).toHaveBeenCalled();
  });

  it('shows "Time up!" when expired', async () => {
    const onTimeUp = vi.fn();
    render(<LabTimer durationMinutes={1} onTimeUp={onTimeUp} />);

    act(() => {
      vi.advanceTimersByTime(60 * 1000);
    });

    expect(screen.getByTestId('lab-timer-display')).toHaveTextContent('Time up!');
  });

  it('applies custom className', () => {
    const { container } = render(<LabTimer durationMinutes={5} className="custom-class" />);
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('displays correct format for 10+ minutes', () => {
    render(<LabTimer durationMinutes={15} />);
    expect(screen.getByTestId('lab-timer-display')).toHaveTextContent('15:00');
  });

  it('persists end time to localStorage', () => {
    render(<LabTimer durationMinutes={5} />);
    const keys = Object.keys(localStorage);
    const timerKey = keys.find((k) => k.startsWith('lab-timer-'));
    expect(timerKey).toBeDefined();
  });
});