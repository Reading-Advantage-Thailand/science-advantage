# Retrospective Log

## PR #152 - Design Lesson Content JSON Schema

**Date**: 2025-11-22
**Issue**: #144
**Epic**: #143 - Rich Curriculum and Interactive Content

### What Went Well
- Clean implementation of Zod schemas for structured lesson content
- Comprehensive test coverage (27 tests)
- Good alignment with existing content-parsers.ts interfaces
- Forward compatibility with unknown field stripping

### Lessons Learned
- Discriminated unions in Zod are powerful for type-safe block rendering
- Optional Thai translations support bilingual content without breaking existing data

### Technical Notes
- Schema location: `lib/schemas/lesson-content.schema.ts`
- Block types: text, vocabulary, image, reading_passage, procedure, materials
- All blocks support optional `id` field for analytics tracking

## PR #153 - Implement Lesson Player Component

**Date**: 2025-11-22
**Issue**: #146
**Epic**: #143 - Rich Curriculum and Interactive Content

### What Went Well
- Clean component architecture with separate block renderers
- Comprehensive test suite (33 tests covering all scenarios)
- Good accessibility implementation (ARIA roles, keyboard nav)
- IntersectionObserver for analytics tracking
- Error boundaries prevent single block failures from crashing player

### Lessons Learned
- Default aspect ratios needed for optional image dimensions to prevent CLS
- useEffect refs need to reset when dependencies change for proper re-triggering
- ARIA list semantics require both role="list" and role="listitem"

### Technical Notes
- Main component: `components/features/lesson/lesson-player.tsx`
- Block components: `components/features/lesson/blocks/`
- Dependencies added: react-markdown, remark-gfm
- Placeholder blocks for #147 (Vocabulary) and #148 (Image Gallery)
