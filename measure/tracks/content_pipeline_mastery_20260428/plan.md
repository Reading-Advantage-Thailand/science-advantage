# Implementation Plan

## Phase 1: Mastery Pipeline Wiring

- [ ] Task: Define failing tests for mastery computation
  - [ ] Write tests for mastery update after quiz submission (standard mastery adjusts based on correctness)
  - [ ] Write tests for MasteryRun status transitions (PENDING → PROCESSING → COMPLETED)
  - [ ] Write tests for multi-standard questions (one question maps to multiple standards)
  - [ ] Write tests for retry attempt weighting (recent attempts weighted higher)
- [ ] Task: Implement mastery computation worker
  - [ ] Implement `processMasteryRun()` function that reads attempt data, evaluates each question's standards, and calls `recordStandardMastery()`
  - [ ] Implement weighted mastery adjustment: correctness * difficulty_weight * attempt_recency_weight
  - [ ] Handle edge cases: NaN protection, mastery clamping to [0,1], evidence count increment
  - [ ] Set MasteryRun status to COMPLETED with correct `updatedCount`
  - [ ] On failure, set MasteryRun status to FAILED with `lastError` populated
- [ ] Task: Wire mastery to quiz submission
  - [ ] After creating QuestionResponses in POST `/api/lessons/{lessonSlug}/quiz`, create a MasteryRun record
  - [ ] Call `processMasteryRun()` synchronously within the transaction (or queue for async if latency is a concern)
  - [ ] Return mastery update summary in quiz response
- [ ] Task: Measure - Manual Verification 'Mastery Pipeline'
  - [ ] Submit a quiz and verify StandardMastery records are updated within 5 seconds
  - [ ] Verify MasteryRun status transitions correctly

## Phase 2: Grade 4 Content Integration

- [ ] Task: Create Grade 4 standards seed file
  - [ ] Parse `data/content/grade-4/standards-mapping.json` into `seed-data/standards/thai-grade-4.json`
  - [ ] Verify standard codes match the Thai national curriculum format (ScX.Y-G4)
  - [ ] Run seed and verify standards are inserted
- [ ] Task: Create Grade 4 curriculum units seed file
  - [ ] Define unit structure for Grade 4 in `seed-data/curriculum-units/thai-grade-4.json`
  - [ ] Map lessons to units with correct ordering
- [ ] Task: Normalize Grade 4 question format
  - [ ] Write a normalization script that maps lowercase question types to uppercase enum values
  - [ ] Write tests for normalization (multiple_choice → MULTIPLE_CHOICE, etc.)
  - [ ] Run normalization on existing Grade 4 question files
- [ ] Task: Extend seed pipeline for Grade 4
  - [ ] Update `seedLessons()` to read from `data/content/grade-4/lessons/` when `--grade=4`
  - [ ] Update `seedQuestions()` to read from `data/content/grade-4/questions/` when `--grade=4`
  - [ ] Wrap Grade 4 block arrays in `{ version: 1, blocks: [...] }` if needed
  - [ ] Add `--grade=4` CLI flag support
- [ ] Task: Measure - Manual Verification 'Grade 4 Seed'
  - [ ] Run `npx prisma db seed --grade=4` and verify all data inserts correctly
  - [ ] Verify Grade 4 lessons appear in the curriculum view

## Phase 3: Content Stub Remediation and Validation

- [ ] Task: Audit and fix Grade 3 Unit 2-10 stubs
  - [ ] For each stub lesson, add a minimum viable structured content: 1 text block (2-3 sentence intro) + 1 vocabulary block (3-5 key terms)
  - [ ] Map standards to each lesson (currently empty for Units 2-10)
  - [ ] Run seed and verify no blank lesson pages
- [ ] Task: Implement seed-time Zod validation
  - [ ] Write tests for validation passing on valid content and failing on invalid content
  - [ ] Add `LessonContentSchema.safeParse()` call in seed pipeline before database insert
  - [ ] Add `QuizQuestionSchema.safeParse()` validation for question files
  - [ ] Report validation errors with file path, lesson ID, and specific failure reason
  - [ ] Fail seed on validation errors (non-zero exit code)
- [ ] Task: Implement Review block renderer
  - [ ] Write tests for ReviewBlock component (renders questions, shows answers on reveal)
  - [ ] Create `ReviewBlock` component in `components/features/lesson/blocks/`
  - [ ] Add `case 'review'` to `BlockRenderer` switch in `LessonPlayer`
- [ ] Task: Implement Quiz block renderer
  - [ ] Write tests for QuizBlock component (inline quiz with question navigation)
  - [ ] Create `QuizBlock` component in `components/features/lesson/blocks/`
  - [ ] Add `case 'quiz'` to `BlockRenderer` switch in `LessonPlayer`
- [ ] Task: Measure - Manual Verification 'Content Pipeline'
  - [ ] Verify seed fails with clear error on invalid content
  - [ ] Verify Grade 3 Unit 2 lessons show real content (not blank)
  - [ ] Verify review blocks render interactively
  - [ ] Verify quiz blocks render inline
