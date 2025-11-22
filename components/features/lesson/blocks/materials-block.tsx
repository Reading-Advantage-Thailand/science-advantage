'use client';

import { cn } from '@/lib/utils';
import type { MaterialsBlock as MaterialsBlockType } from '@/lib/schemas/lesson-content.schema';

interface MaterialsBlockProps {
  block: MaterialsBlockType;
  showThai?: boolean;
  className?: string;
}

/**
 * MaterialsBlock component displays a list of required materials with optional quantities.
 */
export function MaterialsBlock({ block, showThai = false, className }: MaterialsBlockProps) {
  return (
    <section
      className={cn('space-y-3', className)}
      data-block-type="materials"
      data-block-id={block.id}
      aria-label="Materials list"
    >
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        Materials Needed
      </h3>
      <ul className="space-y-2" role="list">
        {block.items.map((material, index) => {
          const itemName = showThai && material.itemThai ? material.itemThai : material.item;

          return (
            <li
              key={`${material.item}-${index}`}
              className="flex items-center gap-3 text-gray-700 dark:text-gray-300"
            >
              <span
                className="h-2 w-2 shrink-0 rounded-full bg-blue-500"
                aria-hidden="true"
              />
              <span>
                {material.quantity && (
                  <span className="mr-2 font-medium text-gray-900 dark:text-gray-100">
                    {material.quantity}
                  </span>
                )}
                {itemName}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
