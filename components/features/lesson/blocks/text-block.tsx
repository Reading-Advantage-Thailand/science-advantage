'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';
import type { TextBlock as TextBlockType } from '@/lib/schemas/lesson-content.schema';

interface TextBlockProps {
  block: TextBlockType;
  showThai?: boolean;
  className?: string;
}

/**
 * TextBlock component renders markdown content with optional Thai translation.
 * Uses react-markdown with GFM support for tables, strikethrough, and autolinks.
 */
export function TextBlock({ block, showThai = false, className }: TextBlockProps) {
  // Use Thai content if requested and available, otherwise fallback to English
  const content = showThai && block.contentThai ? block.contentThai : block.content;

  return (
    <div
      className={cn('prose prose-sm max-w-none dark:prose-invert', className)}
      data-block-type="text"
      data-block-id={block.id}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
