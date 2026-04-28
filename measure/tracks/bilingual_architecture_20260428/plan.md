# Implementation Plan

## Phase 1: Database Schema and Migration

- [ ] Task: Add Thai fields to Lesson model
  - [ ] Write tests for new fields (titleThai, descriptionThai nullable strings)
  - [ ] Add `titleThai` and `descriptionThai` fields to Prisma `Lesson` model
  - [ ] Create and run Prisma migration
  - [ ] Verify existing data is not broken (fields are nullable)
- [ ] Task: Backfill Thai titles from convention
  - [ ] Write a migration script that parses "English / ไทย" title convention
  - [ ] Split on " / " delimiter, assign left to `title`, right to `titleThai`
  - [ ] Handle edge cases: no Thai portion (set titleThai to null), multiple " / " (split on first occurrence only)
  - [ ] Run backfill and verify results
- [ ] Task: Update seed functions for Thai fields
  - [ ] Update `seedLessons()` to populate `titleThai` and `descriptionThai` directly
  - [ ] Update lesson seed JSON files to include explicit `titleThai` field
  - [ ] Verify seed produces correct bilingual data

## Phase 2: Side-by-Side Block Rendering

- [ ] Task: Update TextBlock for side-by-side rendering
  - [ ] Write tests for TextBlock with both languages present
  - [ ] Modify `TextBlock` to render Thai content below English content with a subtle divider
  - [ ] Thai content uses smaller text size or muted color to maintain visual hierarchy
  - [ ] When only one language exists, show only that language (no empty Thai placeholder)
- [ ] Task: Update VocabularyBlock for bilingual display
  - [ ] Write tests for vocabulary flashcard showing Thai term alongside English
  - [ ] Modify vocabulary flashcard front to show both `term` and `thai` fields
  - [ ] Definition remains in the display language
- [ ] Task: Update ReadingPassageBlock for bilingual titles
  - [ ] Show Thai title alongside English title
  - [ ] Content remains in display language (long-form reading toggle still works)
- [ ] Task: Update ProcedureBlock and MaterialsBlock
  - [ ] Show Thai instruction/item alongside English on each step/material
  - [ ] Use compact inline layout (Thai in parentheses or smaller text below)
- [ ] Task: Measure - Manual Verification 'Side-by-Side'
  - [ ] Verify text blocks show Thai below English
  - [ ] Verify vocabulary flashcards show Thai terms
  - [ ] Verify no empty Thai placeholders when Thai content is missing

## Phase 3: Display Preference and API Updates

- [ ] Task: Replace binary toggle with display preference
  - [ ] Write tests for DisplayPreference context (English, Thai, SideBySide modes)
  - [ ] Create `DisplayPreferenceProvider` context replacing `LanguageProvider`
  - [ ] Add preference selector UI (three options: English, Thai, Side-by-Side)
  - [ ] Default to "Side-by-Side" for new users
  - [ ] Persist preference to localStorage
- [ ] Task: Update API routes for bilingual fields
  - [ ] Update `/api/lessons/[lessonSlug]` to return `titleThai` and `descriptionThai` as separate fields
  - [ ] Update `/api/classes/[classId]/curriculum` to return `titleThai` for lessons
  - [ ] Update curriculum accordion to display `titleThai` alongside `title`
- [ ] Task: Update lesson viewer for display preference
  - [ ] In "English" mode: show only English content
  - [ ] In "Thai" mode: show Thai content as primary (fallback to English if Thai missing)
  - [ ] In "Side-by-Side" mode: show both with Thai as secondary/supplementary
  - [ ] Pass `displayPreference` to all block renderers
- [ ] Task: Populate Thai content for key lessons
  - [ ] Audit Grade 3 Unit 1 vocabulary terms — ensure `thai` field is populated
  - [ ] Add `contentThai` to vocabulary blocks in all seeded lessons
  - [ ] For lessons without Thai translation, verify graceful degradation (English only)
- [ ] Task: Measure - Manual Verification 'Display Preference'
  - [ ] Verify the three-way preference selector works
  - [ ] Verify "Side-by-Side" shows both languages
  - [ ] Verify "Thai" mode shows Thai content with English fallback
  - [ ] Verify API returns separate title/titleThai fields
