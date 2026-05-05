import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ScoreTracker, FeedbackMessage, ReviewFeedback } from '../review-feedback';

describe('ScoreTracker', () => {
  it('renders correct count and total', () => {
    render(<ScoreTracker correctCount={3} totalCount={5} />);
    expect(screen.getByText('3 of 5 correct so far')).toBeInTheDocument();
  });

  it('has correct accessibility attributes', () => {
    render(<ScoreTracker correctCount={3} totalCount={5} />);
    const tracker = screen.getByRole('status');
    expect(tracker).toBeInTheDocument();
  });
});

describe('FeedbackMessage', () => {
  it('shows correct message for correct answer', () => {
    render(<FeedbackMessage isCorrect={true} />);
    expect(screen.getByText(/Great job!/)).toBeInTheDocument();
  });

  it('shows incorrect message for wrong answer', () => {
    render(<FeedbackMessage isCorrect={false} />);
    expect(screen.getByText(/Don't worry/)).toBeInTheDocument();
  });

  it('shows custom message when provided', () => {
    render(<FeedbackMessage isCorrect={true} message="Perfect score!" />);
    expect(screen.getByText('Perfect score!')).toBeInTheDocument();
  });
});

describe('ReviewFeedback', () => {
  it('shows correct state for correct answer', () => {
    render(<ReviewFeedback isCorrect={true} />);
    expect(screen.getByText('Correct!')).toBeInTheDocument();
  });

  it('shows incorrect state with correct answer when provided', () => {
    render(<ReviewFeedback isCorrect={false} correctAnswer="Mitochondria" />);
    expect(screen.getByText('Incorrect')).toBeInTheDocument();
    expect(screen.getByText('Correct answer:')).toBeInTheDocument();
    expect(screen.getByText('Mitochondria')).toBeInTheDocument();
  });

  it('shows explanation when provided', () => {
    render(
      <ReviewFeedback
        isCorrect={false}
        correctAnswer="Mitochondria"
        explanation="The mitochondria are the powerhouse of the cell."
      />
    );
    expect(screen.getByText('The mitochondria are the powerhouse of the cell.')).toBeInTheDocument();
  });
});