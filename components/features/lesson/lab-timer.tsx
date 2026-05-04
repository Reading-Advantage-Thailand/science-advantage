'use client';

import { useEffect, useRef, useState } from 'react';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LabTimerProps {
  durationMinutes: number;
  onTimeUp?: () => void;
  className?: string;
}

export function LabTimer({ durationMinutes, onTimeUp, className }: LabTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [isExpired, setIsExpired] = useState(false);
  const endTimeRef = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const storageKey = `lab-timer-${durationMinutes}`;

  useEffect(() => {
    const savedEndTime = localStorage.getItem(storageKey);

    if (savedEndTime) {
      const endTime = parseInt(savedEndTime, 10);
      const now = Date.now();

      if (endTime <= now) {
        setIsExpired(true);
        setTimeRemaining(0);
      } else {
        endTimeRef.current = endTime;
        setTimeRemaining(Math.floor((endTime - now) / 1000));
      }
    } else {
      const newEndTime = Date.now() + durationMinutes * 60 * 1000;
      endTimeRef.current = newEndTime;
      localStorage.setItem(storageKey, newEndTime.toString());
      setTimeRemaining(durationMinutes * 60);
    }
  }, [durationMinutes, storageKey]);

  useEffect(() => {
    if (timeRemaining === null || isExpired) return;

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
  }, [timeRemaining, isExpired, onTimeUp, storageKey]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (timeRemaining === null) {
    return null;
  }

  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-lg px-4 py-2',
        isExpired
          ? 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400'
          : 'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400',
        className
      )}
      role="timer"
      aria-live="polite"
      data-testid="lab-timer"
    >
      <Clock className="h-5 w-5" aria-hidden="true" />
      <span className="font-mono text-lg font-bold" data-testid="lab-timer-display">
        {isExpired ? 'Time up!' : formatTime(timeRemaining)}
      </span>
    </div>
  );
}