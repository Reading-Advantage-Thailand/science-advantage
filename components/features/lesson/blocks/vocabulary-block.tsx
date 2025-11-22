'use client';

import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import type { VocabularyBlock as VocabularyBlockType } from '@/lib/schemas/lesson-content.schema';

interface VocabularyBlockProps {
  block: VocabularyBlockType;
  showThai?: boolean;
  className?: string;
}

/**
 * VocabularyBlock component displays vocabulary terms in a card list.
 * PLACEHOLDER: Will be replaced by VocabularyFlashcards component in #147.
 */
export function VocabularyBlock({ block, showThai: _showThai = false, className }: VocabularyBlockProps) {
  // Note: showThai is unused in this placeholder implementation.
  // Will be used in #147 when VocabularyFlashcards component is implemented.
  void _showThai;
  return (
    <div
      className={cn('space-y-3', className)}
      data-block-type="vocabulary"
      data-block-id={block.id}
      role="list"
      aria-label="Vocabulary terms"
    >
      {block.terms.map((term, index) => (
        <div key={`${term.term}-${index}`} role="listitem">
          <Card className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-baseline gap-2">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {term.term}
                  </h4>
                  {term.thai && (
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      ({term.thai})
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {term.definition}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
}
