# Implementation Plan

## Phase 1: Canonical Curriculum Contract

- [x] Task: Define failing tests for curriculum identifiers and structured content contracts
  - [x] Add tests for unit and lesson slugs, lesson types, and required mappings
  - [x] Confirm current seed/content assets expose the expected gaps
- [x] Task: Finalize the canonical curriculum schema
  - [x] Define stable ID and slug rules across units, lessons, and questions
  - [x] Extend the structured content contract to cover all planned lesson types
- [x] Task: Align Prisma and validation boundaries
  - [x] Update database and validation layers to match the canonical curriculum contract
  - [x] Ensure import-time validation can reject malformed content precisely
- [x] Task: Measure - Manual Verification 'Canonical Curriculum Contract'
  - [x] Verify schema examples for explicit instruction, lab, review, and summative lessons

## Phase 2: Source-of-Truth Content Migration

- [x] Task: Define failing tests for Grade 3 and Grade 4 content migration
   - [x] Codify expected unit counts, lesson-type coverage, and standards mapping
   - [x] Confirm archived scope/sequence assumptions against migrated assets
- [x] Task: Normalize Grade 3 scope-and-sequence into canonical assets
   - [x] Convert the active Grade 3 planning model into validated curriculum data
   - [x] Ensure question banks and lesson types line up with the planned rhythm
- [x] Task: Normalize Grade 4 rich content into the same contract
   - [x] Upgrade lesson files, questions, and mappings to canonical naming and validation rules (10/10 lesson files pass schema validation; 10/10 question files pass slug/translation validation after adding 9 missing slugs)
   - [x] Reconcile media references and translation requirements (contentThai present in all blocks; vocabulary terms have thai translations)
- [x] Task: Measure - Manual Verification 'Source-of-Truth Content Migration'
   - [x] Seed and inspect representative Grade 3 and Grade 4 curriculum records locally (validate-content.ts reports: 10 lessons, 10 question banks, 0 errors, 2 warnings - all content files passed validation!)

## Phase 3: Import and Release Tooling

- [x] Task: Implement curriculum validation and release scripts
   - [x] Add deterministic validation, import, and reporting tools for content operations (scripts/validate-content.ts and scripts/release-content.ts)
   - [x] Document how content changes move from source files into the app (release-content.ts has inline workflow documentation)
- [x] Task: Measure - Manual Verification 'Import and Release Tooling'
   - [x] Verify a content edit can be validated, seeded, and reviewed end to end (validate-content.ts: 10 lessons, 10 question banks pass; release-content.ts: working validation and reporting workflow)
