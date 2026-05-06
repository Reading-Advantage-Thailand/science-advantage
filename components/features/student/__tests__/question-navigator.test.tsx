import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QuestionNavigator } from '../question-navigator';

describe('QuestionNavigator', () => {
  const defaultProps = {
    totalQuestions: 10,
    answeredQuestions: new Set<number>(),
    markedForReview: new Set<number>(),
    currentIndex: 0,
    onNavigate: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correct number of question buttons', () => {
    render(<QuestionNavigator {...defaultProps} />);

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(10);
  });

  it('shows unanswered questions with gray background', () => {
    render(<QuestionNavigator {...defaultProps} />);

    const firstButton = screen.getByTestId('question-nav-1');
    expect(firstButton.className).toContain('bg-gray-200');
  });

  it('shows answered questions with green background', () => {
    const props = {
      ...defaultProps,
      answeredQuestions: new Set([0, 1, 2]),
    };
    render(<QuestionNavigator {...props} />);

    const button1 = screen.getByTestId('question-nav-1');
    const button4 = screen.getByTestId('question-nav-4');

    expect(button1.className).toContain('bg-green-500');
    expect(button4.className).toContain('bg-gray-200');
  });

  it('shows marked for review questions with amber background', () => {
    const props = {
      ...defaultProps,
      markedForReview: new Set([3]),
    };
    render(<QuestionNavigator {...props} />);

    const button4 = screen.getByTestId('question-nav-4');
    expect(button4.className).toContain('bg-amber-400');
  });

  it('calls onNavigate when button is clicked', () => {
    const onNavigate = vi.fn();
    const props = { ...defaultProps, onNavigate };

    render(<QuestionNavigator {...props} />);

    fireEvent.click(screen.getByTestId('question-nav-5'));
    expect(onNavigate).toHaveBeenCalledWith(4);
  });

  it('marks current question with ring indicator', () => {
    const props = { ...defaultProps, currentIndex: 2 };
    render(<QuestionNavigator {...props} />);

    const button3 = screen.getByTestId('question-nav-3');
    expect(button3.className).toContain('ring-2');
  });

  it('has correct accessibility attributes', () => {
    render(<QuestionNavigator {...defaultProps} />);

    const nav = screen.getByRole('navigation', { name: 'Question navigator' });
    expect(nav).toBeInTheDocument();

    const button = screen.getByTestId('question-nav-1');
    expect(button).toHaveAttribute('aria-label', 'Go to question 1, unanswered');
  });

  it('shows answered status in aria-label for answered questions', () => {
    const props = {
      ...defaultProps,
      answeredQuestions: new Set([0]),
    };
    render(<QuestionNavigator {...props} />);

    const button1 = screen.getByTestId('question-nav-1');
    expect(button1).toHaveAttribute('aria-label', 'Go to question 1, answered');
  });

  it('shows review status in aria-label for marked questions', () => {
    const props = {
      ...defaultProps,
      markedForReview: new Set([0]),
    };
    render(<QuestionNavigator {...props} />);

    const button1 = screen.getByTestId('question-nav-1');
    expect(button1).toHaveAttribute('aria-label', 'Go to question 1, review');
  });
});