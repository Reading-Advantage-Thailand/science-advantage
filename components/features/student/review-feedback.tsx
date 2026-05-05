'use client';

import { cn } from '@/lib/utils';
import { CheckCircle2, XCircle } from 'lucide-react';

interface ScoreTrackerProps {
  correctCount: number;
  totalCount: number;
  className?: string;
}

export function ScoreTracker({ correctCount, totalCount, className }: ScoreTrackerProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-lg bg-green-50 px-4 py-2 dark:bg-green-950/30',
        className
      )}
      role="status"
      aria-live="polite"
    >
      <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
      <span className="text-sm font-medium text-green-700 dark:text-green-300">
        {correctCount} of {totalCount} correct so far
      </span>
    </div>
  );
}

interface FeedbackMessageProps {
  isCorrect: boolean;
  message?: string;
  className?: string;
}

const DEFAULT_CORRECT_MESSAGES = [
  'Great job!',
  'Excellent!',
  'You got it!',
  'Perfect!',
  'Well done!',
];

const DEFAULT_INCORRECT_MESSAGES = [
  "Don't worry, keep going!",
  'Almost there!',
  "That's okay, try the next one!",
  'Keep it up!',
  "You'll get the next one!",
];

function getRandomMessage(isCorrect: boolean): string {
  const messages = isCorrect ? DEFAULT_CORRECT_MESSAGES : DEFAULT_INCORRECT_MESSAGES;
  return messages[Math.floor(Math.random() * messages.length)];
}

export function FeedbackMessage({ isCorrect, message, className }: FeedbackMessageProps) {
  const displayMessage = message || getRandomMessage(isCorrect);

  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-lg px-4 py-3',
        isCorrect
          ? 'bg-green-100 text-green-800 dark:bg-green-950/50 dark:text-green-300'
          : 'bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300',
        className
      )}
      role="alert"
    >
      {isCorrect ? (
        <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
      ) : (
        <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
      )}
      <span className="font-medium">{displayMessage}</span>
    </div>
  );
}

interface ReviewFeedbackProps {
  questionId: string;
  isCorrect: boolean;
  correctAnswer?: string;
  explanation?: string;
  className?: string;
}

export function ReviewFeedback({
  isCorrect,
  correctAnswer,
  explanation,
  className,
}: ReviewFeedbackProps) {
  return (
    <div
      className={cn(
        'rounded-lg border p-4',
        isCorrect
          ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30'
          : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30',
        className
      )}
      role="alert"
    >
      <div className="mb-2 flex items-center gap-2">
        {isCorrect ? (
          <>
            <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
            <span className="font-semibold text-green-700 dark:text-green-300">Correct!</span>
          </>
        ) : (
          <>
            <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            <span className="font-semibold text-red-700 dark:text-red-300">Incorrect</span>
          </>
        )}
      </div>
      {!isCorrect && correctAnswer && (
        <p className="mt-2 text-sm">
          <span className="font-medium text-gray-700 dark:text-gray-300">Correct answer: </span>
          <span className="text-gray-900 dark:text-gray-100">{correctAnswer}</span>
        </p>
      )}
      {explanation && (
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{explanation}</p>
      )}
    </div>
  );
}