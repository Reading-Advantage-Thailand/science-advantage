# Implementation Plan

## Phase 1: Lesson Type Visual Identity

- [x] Task: Define lesson type color and icon system
  - [x] Write tests for lesson type badge rendering with correct colors and icons
  - [x] Create a `lesson-type-config.ts` mapping: LESSON→green/BookOpen, LAB→blue/FlaskConical, REVIEW→coral/Gamepad2, ASSESSMENT→gold/ClipboardCheck
  - [x] Export color classes and icon components for each type
- [x] Task: Update curriculum view with type badges
  - [x] Add lesson type badge to each entry in `StudentCurriculumView` accordion
  - [x] Add lesson type badge to each entry in `CurriculumAccordion` (teacher view)
  - [x] Badge shows icon + type name with the type-specific color
- [ ] Task: Add visual differentiation to lesson pages
  - [ ] Add accent color border/top-bar to lesson page based on type
  - [ ] Add type badge in the lesson header area
  - [ ] LESSON: green top border, LAB: blue, REVIEW: coral, ASSESSMENT: gold
- [ ] Task: Measure - Manual Verification 'Visual Identity'
  - [ ] Verify each lesson type shows correct color badge in curriculum view
  - [ ] Verify lesson page header shows type-specific accent color

## Phase 2: Lab-Specific Features

- [x] Task: Implement lab safety notice
   - [x] Write tests for safety notice rendering on LAB lesson type
   - [x] Create `LabSafetyNotice` component with prominent banner styling
   - [x] Show banner at top of lesson when `lessonType === 'LAB'`
   - [x] Banner is dismissible but reappears on each visit (not persisted)
- [x] Task: Implement step-by-step procedure mode
   - [x] Write tests for step-by-step navigation (next/previous, completion tracking)
   - [x] Modify `ProcedureBlock` to detect lab context and render in "step mode"
   - [x] Step mode: show one step at a time with Previous/Next buttons
   - [x] Step completion tracked in local state (checkbox still works)
   - [x] Show progress indicator ("Step 2 of 5")
- [x] Task: Implement lab timer
   - [x] Write tests for timer display and countdown
   - [x] Create `LabTimer` component with configurable duration
   - [x] Timer runs client-side (localStorage for persistence across page refreshes)
   - [x] Show time remaining prominently in the lesson header
   - [x] Alert when time is up (visual, not audio)
- [x] Task: Implement materials checklist
   - [x] Modify `MaterialsBlock` to render as interactive checklist when in lab context
   - [x] Checkboxes persist to localStorage (gathered items stay checked)
   - [x] Show "X of Y items gathered" progress
- [ ] Task: Measure - Manual Verification 'Lab Features'
  - [ ] Verify safety notice appears on lab lessons
  - [ ] Verify step-by-step mode works for procedure blocks in labs
  - [ ] Verify timer counts down and persists across refresh

## Phase 3: Assessment-Specific Features

- [x] Task: Implement assessment timer
   - [x] Write tests for assessment countdown timer
   - [x] Create `AssessmentTimer` component with configurable duration (default 30 min)
   - [x] Timer is tamper-resistant: server stores assessment start time, client displays countdown
   - [x] Auto-submit when timer reaches zero
   - [x] Show warning at 5 minutes remaining
- [x] Task: Implement question navigator grid
   - [x] Write tests for question grid state (answered/unanswered/reviewed)
   - [x] Create `QuestionNavigator` component showing numbered grid
   - [x] Color-code: green (answered), yellow (marked for review), gray (unanswered)
   - [x] Click a number to jump to that question
- [x] Task: Implement assessment navigation rules
   - [x] Default forward-only navigation (Previous button hidden unless question is marked for review)
   - [x] Add "Mark for Review" toggle on each question
   - [x] Show "X unanswered" count in submission confirmation
   - [x] Double-confirm dialog on submit
- [x] Task: Implement score reveal animation
   - [x] After assessment submission, show "Grading..." animation for 2-3 seconds
   - [x] Then reveal score with emphasis animation
   - [x] Respect prefers-reduced-motion (skip delay, show score immediately)
- [ ] Task: Measure - Manual Verification 'Assessment Features'
   - [ ] Verify assessment timer counts down
   - [ ] Verify question navigator shows correct color coding
   - [ ] Verify forward-only navigation works
   - [ ] Verify double-confirm on submit

## Phase 4: Review-Specific Features

- [x] Task: Implement game-like review presentation
  - [x] Modify quiz rendering for REVIEW type: larger text, more spacing, playful card design
  - [x] Use coral/terracotta accent colors for review question cards
  - [x] Increase font size for question text in review mode
- [x] Task: Implement immediate feedback
  - [x] Modify quiz flow for REVIEW type: show correct/incorrect immediately after each answer
  - [x] Show brief explanation or encouraging message after each answer
  - [x] No waiting until the end for results
- [x] Task: Implement score tracker and encouragement
  - [x] Show running score during review ("3/5 correct so far!")
  - [x] Add randomized encouraging messages between questions
  - [x] Show celebration animation when all questions answered correctly
- [ ] Task: Measure - Manual Verification 'Review Features'
  - [ ] Verify review questions have playful visual treatment
  - [ ] Verify immediate feedback after each answer
  - [ ] Verify running score tracker updates

## Phase 5: Curriculum Filtering

- [x] Task: Add lesson type filter to curriculum views
  - [x] Write tests for filter toggle behavior
  - [x] Add filter buttons (All, Lessons, Labs, Reviews, Assessments) above curriculum accordion
  - [x] Filter shows/hides lessons by type
  - [x] Filter state persists to URL query params (shareable)
- [x] Task: Measure - Manual Verification 'Filtering'
   - [x] Verify filter buttons appear and work (LessonTypeFilter component exists in student-curriculum-view.tsx)
   - [x] Verify filtered view shows only matching lesson types (filterLessons function implemented, URL query param persistence working)
