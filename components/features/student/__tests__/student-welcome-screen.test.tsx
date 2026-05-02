import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { StudentWelcomeScreen } from '../student-welcome-screen';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, refresh: vi.fn() }),
}));

vi.mock('../join-class-form', () => ({
  JoinClassForm: () => <div data-testid="join-class-form">JoinClassForm</div>,
}));

const mockUseFirstRun = vi.fn();
vi.mock('@/components/hooks/use-first-run', () => ({
  useFirstRun: () => mockUseFirstRun(),
  invalidateFirstRunCache: vi.fn(),
}));

describe('StudentWelcomeScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  const mockStudent = {
    name: 'Somchai',
    email: 'somchai@example.com',
  };

  describe('when student has no classes (first run)', () => {
    beforeEach(() => {
      mockUseFirstRun.mockReturnValue({ isFirstRun: true, isLoading: false });
    });

    it('renders welcome greeting with student name', () => {
      render(<StudentWelcomeScreen student={mockStudent} />);

      expect(screen.getByText(/welcome, somchai/i)).toBeInTheDocument();
    });

    it('renders encouraging message about joining a class', () => {
      render(<StudentWelcomeScreen student={mockStudent} />);

      expect(
        screen.getByText(/ready to begin your scientific adventure/i)
      ).toBeInTheDocument();
    });

    it('renders the JoinClassForm prominently', () => {
      render(<StudentWelcomeScreen student={mockStudent} />);

      expect(screen.getByTestId('join-class-form')).toBeInTheDocument();
    });

    it('shows helper text about getting class code from teacher', () => {
      render(<StudentWelcomeScreen student={mockStudent} />);

      expect(screen.getByText(/ask your teacher for the class code/i)).toBeInTheDocument();
    });

    it('does not show skip or dismiss option', () => {
      render(<StudentWelcomeScreen student={mockStudent} />);

      expect(screen.queryByRole('button', { name: /skip/i })).not.toBeInTheDocument();
    });
  });

  describe('when student has classes (not first run)', () => {
    it('returns null to hide the welcome screen', () => {
      mockUseFirstRun.mockReturnValue({ isFirstRun: false, isLoading: false });

      const { container } = render(<StudentWelcomeScreen student={mockStudent} />);

      expect(container).toBeEmptyDOMElement();
    });
  });

  describe('loading state', () => {
    it('does not render while checking first-run status', () => {
      mockUseFirstRun.mockReturnValue({ isFirstRun: true, isLoading: true });

      const { container } = render(<StudentWelcomeScreen student={mockStudent} />);

      expect(container).toBeEmptyDOMElement();
    });
  });
});