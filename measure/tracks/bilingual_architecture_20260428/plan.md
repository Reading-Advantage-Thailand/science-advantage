# Implementation Plan

## Phase 1: Database Schema and Migration

- [x] Task: Add Thai fields to Lesson model
  - [x] Write tests for new fields (titleThai, descriptionThai nullable strings)
  - [x] Add `titleThai` and `descriptionThai` fields to Prisma `Lesson` model
  - [x] Create and run Prisma migration
  - [x] Verify existing data is not broken (fields are nullable)
- [x] Task: Backfill Thai titles from convention
  - [x] Write a migration script that parses "English / ไทย" title convention
  - [x] Split on " / " delimiter, assign left to `title`, right to `titleThai`
  - [x] Handle edge cases: no Thai portion (set titleThai to null), multiple " / " (split on first occurrence only)
  - [x] Run backfill and verify results
- [x] Task: Update seed functions for Thai fields
  - [x] Update `seedLessons()` to populate `titleThai` and `descriptionThai` directly
  - [x] Update lesson seed JSON files to include explicit `titleThai` field
  - [x] Verify seed produces correct bilingual data

## Phase 2: Side-by-Side Block Rendering

- [x] Task: Update TextBlock for side-by-side rendering
  - [x] Write tests for TextBlock with both languages present
  - [x] Modify `TextBlock` to render Thai content below English content with a subtle divider
  - [x] Thai content uses smaller text size or muted color to maintain visual hierarchy
  - [x] When only one language exists, show only that language (no empty Thai placeholder)
- [x] Task: Update VocabularyBlock for bilingual display
  - [x] Write tests for vocabulary flashcard showing Thai term alongside English
  - [x] Modify vocabulary flashcard front to show both `term` and `thai` fields
  - [x] Definition remains in the display language
- [x] Task: Update ReadingPassageBlock for bilingual titles
  - [x] Show Thai title alongside English title
  - [x] Content remains in display language (long-form reading toggle still works)
- [x] Task: Update ProcedureBlock and MaterialsBlock
  - [x] Show Thai instruction/item alongside English on each step/material
  - [x] Use compact inline layout (Thai in parentheses or smaller text below)
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
