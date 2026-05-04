import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { LabSafetyNotice } from '../lab-safety-notice';

describe('LabSafetyNotice', () => {
  beforeEach(() => {
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
  });

  it('renders safety notice with correct content', () => {
    render(<LabSafetyNotice />);
    expect(screen.getByText('Lab Safety Notice')).toBeInTheDocument();
    expect(
      screen.getByText(/Always follow your teacher's safety instructions/i)
    ).toBeInTheDocument();
  });

  it('renders with alert role', () => {
    render(<LabSafetyNotice />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('shows dismiss button', () => {
    render(<LabSafetyNotice />);
    expect(screen.getByText('Dismiss')).toBeInTheDocument();
  });

  it('dismisses when dismiss button is clicked', async () => {
    const user = userEvent.setup();
    render(<LabSafetyNotice />);

    await user.click(screen.getByText('Dismiss'));

    expect(screen.queryByText('Lab Safety Notice')).not.toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<LabSafetyNotice className="my-custom-class" />);
    expect(container.firstChild).toHaveClass('my-custom-class');
  });

  it('displays AlertTriangle icon', () => {
    render(<LabSafetyNotice />);
    const icon = document.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('dismiss button has aria-label', async () => {
    const user = userEvent.setup();
    render(<LabSafetyNotice />);

    const dismissButton = screen.getByRole('button', { name: /dismiss safety notice/i });
    expect(dismissButton).toBeInTheDocument();

    await user.click(dismissButton);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});