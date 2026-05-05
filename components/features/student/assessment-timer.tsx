'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AssessmentTimerProps {
  durationMinutes: number;
  startTime: Date;
  onTimeUp?: () => void;
  onWarning?: () => void;
  className?: string;
}

export function AssessmentTimer({
  durationMinutes,
  startTime,
  onTimeUp,
  onWarning,
  className,
}: AssessmentTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [isExpired, setIsExpired] = useState(false);
  const [hasWarned, setHasWarned] = useState(false);
  const endTimeRef = useRef<number>(startTime.getTime() + durationMinutes * 60 * 1000);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const warningFiredRef = useRef(false);

  const storageKey = `assessment-timer-${startTime.toISOString()}`;

  useEffect(() => {
    const now = Date.now();
    const remaining = Math.floor((endTimeRef.current - now) / 1000);

    if (remaining <= 0) {
      setIsExpired(true);
      setTimeRemaining(0);
    } else {
      setTimeRemaining(remaining);
      localStorage.setItem(storageKey, endTimeRef.current.toString());
    }
  }, [storageKey]);

  useEffect(() => {
    if (timeRemaining === null || isExpired) return;

    if (timeRemaining <= 5 * 60 && !warningFiredRef.current) {
      warningFiredRef.current = true;
      onWarning?.();
    }

    intervalRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null || prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setIsExpired(true);
          localStorage.removeItem(storageKey);
          onTimeUp?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [timeRemaining, isExpired, onTimeUp, onWarning, storageKey]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isWarning = timeRemaining !== null && timeRemaining <= 5 * 60 && !isExpired;

  if (timeRemaining === null) {
    return null;
  }

  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-lg px-4 py-2 font-mono text-lg font-bold',
        isExpired
          ? 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400'
          : isWarning
            ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 animate-pulse'
            : 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400',
        className
      )}
      role="timer"
      aria-live="polite"
      aria-label={isExpired ? 'Time is up' : `Time remaining: ${formatTime(timeRemaining)}`}
      data-testid="assessment-timer"
    >
      {isWarning ? (
        <AlertTriangle className="h-5 w-5" aria-hidden="true" />
      ) : (
        <Clock className="h-5 w-5" aria-hidden="true" />
      )}
      <span data-testid="assessment-timer-display">
        {isExpired ? 'Time up!' : formatTime(timeRemaining)}
      </span>
      {isWarning && !hasWarned && (
        <span className="text-sm font-normal">5 min warning</span>
      )}
    </div>
  );
}