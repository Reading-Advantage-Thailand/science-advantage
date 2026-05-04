'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import type { ProcedureBlock as ProcedureBlockType, ProcedureStep } from '@/lib/schemas/lesson-content.schema';

interface StepModeProcedureBlockProps {
  block: ProcedureBlockType;
  showThai?: boolean;
  className?: string;
}

interface StepItemProps {
  step: ProcedureStep;
  showThai: boolean;
  isChecked: boolean;
  onToggle: () => void;
}

function StepItem({ step, showThai, isChecked, onToggle }: StepItemProps) {
  const hasThai = showThai && step.instructionThai;

  return (
    <div className="flex items-start gap-4">
      <div
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-medium',
          isChecked
            ? 'bg-green-500 text-white'
            : 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
        )}
        aria-hidden="true"
      >
        {step.stepNumber}
      </div>
      <div className="flex-1 pt-1">
        <p
          className={cn(
            'text-base',
            isChecked && 'text-gray-500 line-through dark:text-gray-400'
          )}
        >
          {step.instruction}
        </p>
        {hasThai && (
          <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
            {step.instructionThai}
          </p>
        )}
        {step.subSteps && step.subSteps.length > 0 && (
          <ul className="mt-2 ml-4 space-y-1" aria-label="Sub-steps">
            {step.subSteps.map((subStep, index) => (
              <li
                key={index}
                className={cn(
                  'text-sm text-gray-600 dark:text-gray-400',
                  isChecked && 'text-gray-400 line-through dark:text-gray-500'
                )}
              >
                <span aria-hidden="true">- </span>
                {subStep}
              </li>
            ))}
          </ul>
        )}
        <div className="mt-3">
          <Checkbox
            id={`step-check-${step.stepNumber}`}
            checked={isChecked}
            onCheckedChange={onToggle}
            aria-label={`Mark step ${step.stepNumber} as complete`}
          />
          <label
            htmlFor={`step-check-${step.stepNumber}`}
            className="ml-2 text-sm text-gray-600 dark:text-gray-400"
          >
            Mark as complete
          </label>
        </div>
      </div>
    </div>
  );
}

export function StepModeProcedureBlock({
  block,
  showThai = false,
  className,
}: StepModeProcedureBlockProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [checkedSteps, setCheckedSteps] = useState<Set<number>>(new Set());

  const totalSteps = block.steps.length;
  const step = block.steps[currentStep];
  const isFirst = currentStep === 0;
  const isLast = currentStep === totalSteps - 1;

  const toggleStep = (stepNumber: number) => {
    setCheckedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(stepNumber)) {
        next.delete(stepNumber);
      } else {
        next.add(stepNumber);
      }
      return next;
    });
  };

  const goNext = () => {
    if (!isLast) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const goPrevious = () => {
    if (!isFirst) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  return (
    <section
      className={cn('space-y-6', className)}
      data-block-type="procedure"
      data-block-id={block.id}
      data-testid={`procedure-block-step-mode-${block.id ?? 'unknown'}`}
      aria-label="Step-by-step procedure"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Procedure
        </h3>
        <span
          className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700 dark:bg-blue-900 dark:text-blue-300"
          aria-live="polite"
        >
          Step {currentStep + 1} of {totalSteps}
        </span>
      </div>

      <div
        className="rounded-lg border border-blue-200 bg-blue-50 p-6 dark:border-blue-800 dark:bg-blue-950/20"
        data-testid="procedure-step-content"
      >
        <StepItem
          step={step}
          showThai={showThai}
          isChecked={checkedSteps.has(step.stepNumber)}
          onToggle={() => toggleStep(step.stepNumber)}
        />
      </div>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={goPrevious}
          disabled={isFirst}
          className={cn(
            'flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium',
            isFirst
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-600'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
          )}
          aria-label="Previous step"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </button>

        <div className="text-sm text-gray-500 dark:text-gray-400">
          {checkedSteps.size} of {totalSteps} completed
        </div>

        <button
          type="button"
          onClick={goNext}
          disabled={isLast}
          className={cn(
            'flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium',
            isLast
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-600'
              : 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600'
          )}
          aria-label="Next step"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}