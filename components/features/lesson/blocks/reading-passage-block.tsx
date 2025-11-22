'use client';

import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import type { ReadingPassageBlock as ReadingPassageBlockType } from '@/lib/schemas/lesson-content.schema';

interface ReadingPassageBlockProps {
  block: ReadingPassageBlockType;
  showThai?: boolean;
  className?: string;
}

/**
 * ReadingPassageBlock component displays longer text content with distinct styling.
 * Features a warm amber background, title, content, and word count badge.
 */
export function ReadingPassageBlock({ block, showThai = false, className }: ReadingPassageBlockProps) {
  const title = showThai && block.titleThai ? block.titleThai : block.title;
  const content = showThai && block.contentThai ? block.contentThai : block.content;

  return (
    <article
      className={cn(
        'rounded-lg bg-amber-50 p-6 dark:bg-amber-950/30',
        className
      )}
      data-block-type="reading_passage"
      data-block-id={block.id}
      aria-label={`Reading passage: ${title}`}
    >
      <header className="mb-4 flex items-start justify-between gap-4">
        <h3 className="text-xl font-semibold text-amber-900 dark:text-amber-100">
          {title}
        </h3>
        <Badge
          variant="secondary"
          className="shrink-0 bg-amber-200 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
        >
          {block.wordCount} words
        </Badge>
      </header>
      <div className="prose prose-sm max-w-none text-amber-900 dark:prose-invert dark:text-amber-100">
        <p className="whitespace-pre-wrap">{content}</p>
      </div>
    </article>
  );
}
