'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

interface GradingAnimationProps {
  onComplete?: () => void;
}

export function GradingAnimation({ onComplete }: GradingAnimationProps) {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-16">
      <Loader2 className="h-12 w-12 animate-spin text-amber-500" />
      <p className="mt-4 text-lg font-medium text-gray-700 dark:text-gray-300">
        Grading{dots}
      </p>
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
        Please wait while we process your answers
      </p>
    </div>
  );
}