'use client';

import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LabSafetyNoticeProps {
  className?: string;
}

export function LabSafetyNotice({ className }: LabSafetyNoticeProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) {
    return null;
  }

  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/30',
        className
      )}
      role="alert"
      data-testid="lab-safety-notice"
    >
      <AlertTriangle
        className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400"
        aria-hidden="true"
      />
      <div className="flex-1">
        <p className="font-medium text-amber-800 dark:text-amber-200">
          Lab Safety Notice
        </p>
        <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">
          Always follow your teacher&apos;s safety instructions. Wear protective equipment when required, keep workspaces clean, and report any accidents immediately.
        </p>
      </div>
      <button
        type="button"
        onClick={() => setIsDismissed(true)}
        className="shrink-0 rounded-md px-2 py-1 text-sm text-amber-700 hover:bg-amber-100 dark:text-amber-300 dark:hover:bg-amber-900/50"
        aria-label="Dismiss safety notice"
      >
        Dismiss
      </button>
    </div>
  );
}