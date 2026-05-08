# Implementation Plan

## Phase 1: Navigation and Lesson Entry

- [x] Task: Define failing tests for student navigation and stable lesson routes
  - [x] Cover class, unit, and lesson deep links using canonical slugs
  - [x] Capture current routing inconsistencies around lesson identifiers
- [x] Task: Implement stable curriculum navigation
  - [x] Align student routes, loaders, and links with canonical curriculum identifiers
  - [x] Remove ambiguous or duplicate lesson entry paths
- [x] Task: Harden lesson access and completion state loading
  - [x] Ensure enrollment, access checks, and completion reads stay consistent
  - [x] Fix empty/error states so they support real classroom use
- [ ] Task: Measure - Manual Verification 'Navigation and Lesson Entry'
  - [ ] Verify a student can enter a class and launch lessons from multiple entry points

## Phase 2: Lesson Type Delivery

- [x] Task: Define failing tests for lesson-type rendering and bilingual scaffolding
  - [x] Cover supported block types and lesson modes
  - [x] Cover Thai toggle behavior only when translated content exists
- [ ] Task: Implement lesson-type specific student experiences
  - [ ] Finalize rendering for explicit instruction, lab, review, and summative lessons
  - [ ] Ensure structured content validation failures degrade gracefully
- [ ] Task: Remove fake translation and placeholder behaviors
  - [ ] Make bilingual affordances conditional on real content
  - [ ] Tighten empty/loading states for lesson media and content blocks
- [ ] Task: Measure - Manual Verification 'Lesson Type Delivery'
  - [ ] Review one lesson of each type and verify Thai scaffolding behavior

## Phase 3: Quiz, Completion, and Next Step

- [ ] Task: Define failing tests for attempt submission and post-lesson guidance
  - [ ] Cover scoring, completion updates, retries, and recommendation fallback behavior
- [ ] Task: Implement the complete post-lesson loop
  - [ ] Align quiz submission, completion persistence, and next-step UI
  - [ ] Ensure deterministic fallback guidance remains useful when AI is unavailable
- [ ] Task: Measure - Manual Verification 'Quiz, Completion, and Next Step'
  - [ ] Verify a student can complete a lesson, submit a quiz, and receive the correct next action
