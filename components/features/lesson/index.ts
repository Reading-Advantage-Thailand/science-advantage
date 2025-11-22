/**
 * Lesson feature components barrel export.
 */

export { LessonPlayer, BlockErrorBoundary } from './lesson-player';
export type { LessonPlayerProps } from './lesson-player';

// Re-export individual blocks for advanced usage
export {
  TextBlock,
  VocabularyBlock,
  ImageBlock,
  ReadingPassageBlock,
  ProcedureBlock,
  MaterialsBlock,
} from './blocks';
