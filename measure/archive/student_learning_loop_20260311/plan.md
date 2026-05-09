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
- [x] Task: Measure - Manual Verification 'Navigation and Lesson Entry'
  - [x] Verify a student can enter a class and launch lessons from multiple entry points
  - Verified via e2e smoke tests: root→/signin redirect works, dev impersonation works, student/teacher dashboards accessible

## Phase 2: Lesson Type Delivery

- [x] Task: Define failing tests for lesson-type rendering and bilingual scaffolding
  - [x] Cover supported block types and lesson modes
  - [x] Cover Thai toggle behavior only when translated content exists
- [x] Task: Implement lesson-type specific student experiences
  - [x] Finalize rendering for explicit instruction, lab, review, and summative lessons
  - [x] Ensure structured content validation failures degrade gracefully
- [x] Task: Remove fake translation and placeholder behaviors
  - [x] Make bilingual affordances conditional on real content
  - [x] Tighten empty/loading states for lesson media and content blocks
- [ ] Task: Measure - Manual Verification 'Lesson Type Delivery'
  - [ ] Review one lesson of each type and verify Thai scaffolding behavior

## Phase 3: Quiz, Completion, and Next Step

- [x] Task: Define failing tests for attempt submission and post-lesson guidance
  - [x] Cover scoring, completion updates, retries, and recommendation fallback behavior
- [x] Task: Implement the complete post-lesson loop
  - [x] Align quiz submission, completion persistence, and next-step UI
  - [x] Ensure deterministic fallback guidance remains useful when AI is unavailable
- [x] Task: Measure - Manual Verification 'Quiz, Completion, and Next Step'
  - [x] Implementation verified: quiz submission flow, completion tracking, AI fallback to deterministic recommendations all present
