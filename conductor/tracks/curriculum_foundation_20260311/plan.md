# Implementation Plan

## Phase 1: Canonical Curriculum Contract

- [x] Task: Define failing tests for curriculum identifiers and structured content contracts
  - [x] Add tests for unit and lesson slugs, lesson types, and required mappings
  - [x] Confirm current seed/content assets expose the expected gaps
- [ ] Task: Finalize the canonical curriculum schema
  - [ ] Define stable ID and slug rules across units, lessons, and questions
  - [ ] Extend the structured content contract to cover all planned lesson types
- [ ] Task: Align Prisma and validation boundaries
  - [ ] Update database and validation layers to match the canonical curriculum contract
  - [ ] Ensure import-time validation can reject malformed content precisely
- [ ] Task: Conductor - Manual Verification 'Canonical Curriculum Contract'
  - [ ] Verify schema examples for explicit instruction, lab, review, and summative lessons

## Phase 2: Source-of-Truth Content Migration

- [ ] Task: Define failing tests for Grade 3 and Grade 4 content migration
  - [ ] Codify expected unit counts, lesson-type coverage, and standards mapping
  - [ ] Confirm archived scope/sequence assumptions against migrated assets
- [ ] Task: Normalize Grade 3 scope-and-sequence into canonical assets
  - [ ] Convert the active Grade 3 planning model into validated curriculum data
  - [ ] Ensure question banks and lesson types line up with the planned rhythm
- [ ] Task: Normalize Grade 4 rich content into the same contract
  - [ ] Upgrade lesson files, questions, and mappings to canonical naming and validation rules
  - [ ] Reconcile media references and translation requirements
- [ ] Task: Conductor - Manual Verification 'Source-of-Truth Content Migration'
  - [ ] Seed and inspect representative Grade 3 and Grade 4 curriculum records locally

## Phase 3: Import and Release Tooling

- [ ] Task: Implement curriculum validation and release scripts
  - [ ] Add deterministic validation, import, and reporting tools for content operations
  - [ ] Document how content changes move from source files into the app
- [ ] Task: Conductor - Manual Verification 'Import and Release Tooling'
  - [ ] Verify a content edit can be validated, seeded, and reviewed end to end
