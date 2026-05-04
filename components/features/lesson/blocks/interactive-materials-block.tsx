'use client';

import { useEffect, useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import type { MaterialsBlock as MaterialsBlockType } from '@/lib/schemas/lesson-content.schema';

interface InteractiveMaterialsBlockProps {
  block: MaterialsBlockType;
  showThai?: boolean;
  className?: string;
}

export function InteractiveMaterialsBlock({
  block,
  showThai = false,
  className,
}: InteractiveMaterialsBlockProps) {
  const storageKey = `materials-checklist-${block.id ?? 'unknown'}`;
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setCheckedItems(new Set(parsed));
      } catch {
        setCheckedItems(new Set());
      }
    }
  }, [storageKey]);

  const toggleItem = (item: string) => {
    setCheckedItems((prev) => {
      const next = new Set(prev);
      if (next.has(item)) {
        next.delete(item);
      } else {
        next.add(item);
      }
      localStorage.setItem(storageKey, JSON.stringify([...next]));
      return next;
    });
  };

  const totalItems = block.items.length;
  const gatheredCount = checkedItems.size;

  return (
    <section
      className={cn('space-y-4', className)}
      data-block-type="materials"
      data-block-id={block.id}
      data-testid={`materials-block-interactive-${block.id ?? 'unknown'}`}
      aria-label="Materials checklist"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Materials Needed
        </h3>
        <span
          className={cn(
            'rounded-full px-3 py-1 text-sm font-medium',
            gatheredCount === totalItems
              ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
              : 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
          )}
          aria-live="polite"
        >
          {gatheredCount} of {totalItems} gathered
        </span>
      </div>

      <ul className="space-y-3" role="list">
        {block.items.map((material, index) => {
          const hasThai = showThai && material.itemThai;
          const isChecked = checkedItems.has(material.item);

          return (
            <li key={`${material.item}-${index}`}>
              <div
                className={cn(
                  'flex items-start gap-3 rounded-lg border p-3 transition-colors',
                  isChecked
                    ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20'
                    : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900'
                )}
              >
                <Checkbox
                  id={`material-${index}`}
                  checked={isChecked}
                  onCheckedChange={() => toggleItem(material.item)}
                  aria-label={`Mark ${material.item} as gathered`}
                />
                <div className="flex-1">
                  <label
                    htmlFor={`material-${index}`}
                    className={cn(
                      'cursor-pointer',
                      isChecked && 'text-gray-500 line-through dark:text-gray-400'
                    )}
                  >
                    <span>
                      {material.quantity && (
                        <span className="mr-2 font-medium text-gray-900 dark:text-gray-100">
                          {material.quantity}
                        </span>
                      )}
                      {material.item}
                    </span>
                  </label>
                  {hasThai && (
                    <p
                      className={cn(
                        'mt-0.5 text-sm',
                        isChecked
                          ? 'text-gray-400 dark:text-gray-500'
                          : 'text-gray-500 dark:text-gray-400'
                      )}
                    >
                      {material.itemThai}
                    </p>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {gatheredCount === totalItems && totalItems > 0 && (
        <p
          className="text-sm font-medium text-green-600 dark:text-green-400"
          role="status"
        >
          All materials gathered! Ready to begin.
        </p>
      )}
    </section>
  );
}