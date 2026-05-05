'use client';

import { cn } from '@/lib/utils';

interface QuestionNavigatorProps {
  totalQuestions: number;
  answeredQuestions: Set<number>;
  markedForReview: Set<number>;
  currentIndex: number;
  onNavigate: (index: number) => void;
  className?: string;
}

export function QuestionNavigator({
  totalQuestions,
  answeredQuestions,
  markedForReview,
  currentIndex,
  onNavigate,
  className,
}: QuestionNavigatorProps) {
  const getQuestionStatus = (index: number) => {
    if (markedForReview.has(index)) return 'review';
    if (answeredQuestions.has(index)) return 'answered';
    return 'unanswered';
  };

  const statusColors = {
    answered: 'bg-green-500 text-white hover:bg-green-600',
    review: 'bg-amber-400 text-amber-900 hover:bg-amber-500',
    unanswered: 'bg-gray-200 text-gray-600 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600',
  };

  return (
    <div
      className={cn('rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900', className)}
      role="navigation"
      aria-label="Question navigator"
    >
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Question Navigator
        </h3>
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <span className="h-3 w-3 rounded bg-green-500"></span>
            Answered
          </span>
          <span className="flex items-center gap-1">
            <span className="h-3 w-3 rounded bg-amber-400"></span>
            Review
          </span>
          <span className="flex items-center gap-1">
            <span className="h-3 w-3 rounded bg-gray-200 dark:bg-gray-700"></span>
            Unanswered
          </span>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-2 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10">
        {Array.from({ length: totalQuestions }, (_, i) => {
          const status = getQuestionStatus(i);
          const isCurrent = i === currentIndex;

          return (
            <button
              key={i}
              onClick={() => onNavigate(i)}
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium transition-all',
                statusColors[status],
                isCurrent && 'ring-2 ring-offset-2 ring-blue-500 dark:ring-offset-gray-900',
              )}
              aria-label={`Go to question ${i + 1}, ${status}`}
              aria-current={isCurrent ? 'step' : undefined}
              data-testid={`question-nav-${i + 1}`}
            >
              {i + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
}