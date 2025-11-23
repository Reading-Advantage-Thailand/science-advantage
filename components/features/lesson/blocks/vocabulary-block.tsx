'use client';

import { cn } from '@/lib/utils';
import { VocabularyFlashcards } from '@/components/features/lesson/vocabulary-flashcards';
import type { VocabularyBlock as VocabularyBlockType } from '@/lib/schemas/lesson-content.schema';

interface VocabularyBlockProps {
  block: VocabularyBlockType;
  showThai?: boolean;
  className?: string;
  mode?: 'carousel' | 'grid';
  onTermReviewed?: (term: string, recalled: 'easy' | 'hard') => void;
}

/**
 * VocabularyBlock component displays vocabulary terms as interactive flashcards.
 * Supports both carousel mode (one card at a time) and grid mode (all cards visible).
 *
 * Features:
 * - 3D flip animation (respects prefers-reduced-motion)
 * - Self-assessment tracking (easy/hard)
 * - Keyboard navigation (Arrow keys in carousel, Enter/Space to flip)
 * - Progress indicators
 */
export function VocabularyBlock({
  block,
  showThai = false,
  className,
  mode = 'carousel',
  onTermReviewed,
}: VocabularyBlockProps) {
  return (
    <div
      className={cn('', className)}
      data-block-type="vocabulary"
      data-block-id={block.id}
    >
      <VocabularyFlashcards
        terms={block.terms}
        showThai={showThai}
        mode={mode}
        onTermReviewed={onTermReviewed}
      />
    </div>
  );
}
