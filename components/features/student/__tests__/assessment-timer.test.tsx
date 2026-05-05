import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AssessmentTimer } from '../assessment-timer';

describe('AssessmentTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
    localStorage.clear();
  });

  it('renders null when timeRemaining is null', () => {
    const { container } = render(
      <AssessmentTimer
        durationMinutes={30}
        startTime={new Date()}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('displays time remaining in MM:SS format', async () => {
    const startTime = new Date();
    vi.setSystemTime(startTime.getTime() + 1000);

    render(
      <AssessmentTimer
        durationMinutes={30}
        startTime={startTime}
      />
    );

    await waitFor(() => {
      const display = screen.getByTestId('assessment-timer-display');
      expect(display.textContent).toMatch(/^\d{2}:\d{2}$/);
    });
  });

  it('shows warning state when 5 minutes or less remain', async () => {
    const startTime = new Date();
    const fiveMinutesAgo = new Date(Date.now() - 25 * 60 * 1000);
    vi.setSystemTime(fiveMinutesAgo.getTime() + 1000);

    render(
      <AssessmentTimer
        durationMinutes={30}
        startTime={startTime}
      />
    );

    await waitFor(() => {
      const timer = screen.getByTestId('assessment-timer');
      expect(timer.className).toContain('animate-pulse');
    });
  });

  it('calls onTimeUp when timer reaches zero', async () => {
    const onTimeUp = vi.fn();
    const startTime = new Date();
    const almostExpired = new Date(Date.now() - (30 * 60 * 1000 - 1000));
    vi.setSystemTime(almostExpired);

    render(
      <AssessmentTimer
        durationMinutes={30}
        startTime={startTime}
        onTimeUp={onTimeUp}
      />
    );

    await waitFor(() => {
      const display = screen.getByTestId('assessment-timer-display');
      expect(display.textContent).toBe('Time up!');
    });

    expect(onTimeUp).toHaveBeenCalled();
  });

  it('calls onWarning when 5 minutes remaining', async () => {
    const onWarning = vi.fn();
    const startTime = new Date();
    const twentyFiveMinutesAgo = new Date(Date.now() - 25 * 60 * 1000);
    vi.setSystemTime(twentyFiveMinutesAgo);

    render(
      <AssessmentTimer
        durationMinutes={30}
        startTime={startTime}
        onWarning={onWarning}
      />
    );

    await waitFor(() => {
      expect(onWarning).toHaveBeenCalled();
    });
  });

  it('persists to localStorage', async () => {
    const startTime = new Date();
    const storageKey = `assessment-timer-${startTime.toISOString()}`;

    render(
      <AssessmentTimer
        durationMinutes={30}
        startTime={startTime}
      />
    );

    await waitFor(() => {
      const stored = localStorage.getItem(storageKey);
      expect(stored).toBeTruthy();
    });
  });

  it('has correct accessibility attributes', async () => {
    const startTime = new Date();

    render(
      <AssessmentTimer
        durationMinutes={30}
        startTime={startTime}
      />
    );

    await waitFor(() => {
      const timer = screen.getByTestId('assessment-timer');
      expect(timer).toHaveAttribute('role', 'timer');
      expect(timer).toHaveAttribute('aria-live', 'polite');
    });
  });
});